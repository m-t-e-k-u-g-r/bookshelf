import {checkAccessToken} from "../lib/utils.js";
import type {Request, Response, NextFunction} from "express";
import type {AuthenticatedRequest} from "../types/request.js";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('authorization');
    if (!authHeader) return res.status(401).json({ error: 'No access token provided' });

    const result = checkAccessToken(authHeader);

    const userId = result.data.userId;
    if (result.status === 200 && typeof userId === 'number') {
        (req as AuthenticatedRequest).userId = userId;
        next();
    } else {
        res.status(result.status).send('Invalid Token');
    }
};