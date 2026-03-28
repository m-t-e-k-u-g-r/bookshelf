import express from "express";
import { type Router, type Request, type Response } from "express";
import {DbDataManager as db} from "../lib/dbDataManager.js";
import bcrypt from 'bcrypt';
import jwt, {type JwtPayload} from 'jsonwebtoken';
import { SqlError } from 'mariadb';
import {type AuthenticatedRequest, authMiddleware} from "../lib/utils.js";
import zxcvbn from 'zxcvbn';
import { rateLimit } from 'express-rate-limit';

const router: Router = express.Router();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: { error: 'To many request. Please try again later.' }
})

async function generateRefreshToken(id: number) {
    const jti = crypto.randomUUID();
    const userId = String(id);
    if (process.env.REFRESH_TOKEN_SECRET == undefined) return null;
    const refreshToken = jwt.sign(
        { userId: userId },
        process.env.REFRESH_TOKEN_SECRET, {
        jwtid: jti,
        expiresIn: '1d'
    });

    try {
        await db.addRefreshToken(id, jti);
    } catch (e) {
        return null;
    }
    return refreshToken;
}

function generateAccessToken(id: string) {
    if (process.env.ACCESS_TOKEN_SECRET == undefined) return null;
    return jwt.sign(
        { userId: id },
        process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '10m'
    });
}

function checkPassword(password: string, password_hash: string) {
    return bcrypt.compare(password, password_hash);
}

router.route('/me')
    .get(authMiddleware, async (req: AuthenticatedRequest, res: Response)=> {
        // #swagger.tags = ['Auth']
        const userId = req.userId;
        if (!userId) return res.sendStatus(401);

        const user = await db.getUserById(userId);
        if (!user) return res.sendStatus(401);

        return res.status(200).json({ id: userId, email: user.email});
    });

router.route('/signup')
    .post(limiter, async (req: Request, res: Response) => {
        // #swagger.tags = ['Auth']
        const email: string = req.body.email;
        const password: string = req.body.password;
        if (email == undefined || password == undefined) return res.status(400).json({error: 'Invalid request body'});

        const pwd_check = zxcvbn(password);
        if (pwd_check.score < 3 || (pwd_check.crack_times_seconds.offline_slow_hashing_1e4_per_second as number) < 1e6) {
            return res.status(400).json({
                error: 'Password is too weak',
                warning: pwd_check.feedback.warning,
                suggestions: pwd_check.feedback.suggestions
            });
        }

        const hash: string = await bcrypt.hash(password, 12);

        try {
            await db.signupUser(email, hash);

            const entry = await db.getUser(email);
            if (entry == null) return res.sendStatus(500);
            const id = entry.id;

            const refreshToken = await generateRefreshToken(id);
            if (refreshToken == null) return res.sendStatus(500);

            res.setHeader('Set-Cookie', refreshToken)
            return res.status(201).json({ refreshToken: refreshToken });
        } catch (error) {
            if (isSqlError(error) && error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({error: 'User already exists'});
            }
            console.log('Signup failed', error);
            return res.status(500).json({error: 'Failed to signup user'});
        }
    });

router.route('/login')
    .post(limiter, async (req: Request, res: Response) => {
        // #swagger.tags = ['Auth']
        const email: string = req.body.email;
        const password: string = req.body.password;
        if (email == undefined || password == undefined) return res.status(400).json({error: 'Invalid request body'});

        try {
            const entry = await db.getUser(email);
            if (entry == null) return res.status(401).json({error: 'Invalid credentials'});

            const correct = await checkPassword(password, entry.password_hash);
            if (!correct) return res.status(401).json({error: 'Invalid credentials'});

            const refreshToken = await generateRefreshToken(entry.id);
            if (refreshToken == null) return res.sendStatus(500);

            res.setHeader('Set-Cookie', refreshToken);
            return res.status(200).json({ refreshToken: refreshToken });
        } catch (e) {
            console.log('Login failed', e);
            return res.status(500).json({error: `Failed to login user`});
        }
    });

router.route('/refresh')
    .post(async (req: Request, res: Response) => {
        // #swagger.tags = ['Auth']
        const refreshToken: string = req.body.refreshToken;
        if (refreshToken == undefined) return res.status(401).json({error: 'No refresh token provided'});

        try {
            if (process.env.REFRESH_TOKEN_SECRET == undefined) return res.status(500).json({error: 'Refresh token secret not set'});
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

            if (typeof decoded === 'string') return res.status(403).json({error: 'Invalid refresh token'});
            const { jti, userId } = decoded as JwtPayload;

            if (!jti || !userId) return res.status(403).json({error: 'Malformed token'});
            const db_token = await db.getRefreshTokenByJti(jti);
            if (typeof db_token !== 'string') return res.status(403).json({error: 'Invalid refresh token'});

            const newAccessToken = generateAccessToken(userId);
            return res.status(200).json({ accessToken: newAccessToken });
        } catch (e) {
            return res.status(403).json({error: 'Failed to verify refresh token'});
        }
    });

router.route('/logout')
    .delete(async (req: Request, res: Response) => {
        // #swagger.tags = ['Auth']
        const refreshToken: string = req.body.refreshToken;

        if (refreshToken == undefined) return res.status(401).json({error: 'No refresh token provided'});
        if (process.env.REFRESH_TOKEN_SECRET == undefined) return res.status(500).json({error: 'Refresh token secret not set'});

        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            if (typeof decoded === 'string') return res.status(403).json({error: 'Invalid refresh token'});
            const jti = decoded.jti;
            if (!jti) return res.status(403).json({error: 'Malformed token'});

            await db.revokeRefreshToken(jti);
            return res.sendStatus(204);
        } catch (e) {
            return res.status(500).json({error: 'Failed to log out user'});
        }
    });

router.route('/delete-acc')
    .delete(authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
        // #swagger.tags = ['Auth']
        const userId = req.userId;
        if (!userId) return res.sendStatus(401);
        try {
            await db.deleteUser(userId);
            return res.sendStatus(204);
        } catch (e) {
            return res.status(500).json({error: 'Failed to delete account'});
        }
    });

function isSqlError(err: unknown): err is SqlError {
    return typeof err === 'object' && err !== null && 'code' in err;
}

export default router;
