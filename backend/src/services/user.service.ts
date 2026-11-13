import type {Pool} from "mariadb";
import {getPool} from "./database.service.js";

export class UserService {
    static async signupUser(email: string, password_hash: string) {
        try {
            const pool: Pool = await getPool();
            return await pool.query(`
                INSERT INTO users (email, password_hash)
                VALUES (?, ?)
                `, [email, password_hash]
            );
        } catch (e) {
            throw e;
        }
    }
    static async deleteUser(userId: number) {
        try {
            const pool: Pool = await getPool();
            return await pool.query(`
                DELETE FROM users
                WHERE id = ?
                `, [userId]
            );
        } catch (e) {
            throw e;
        }
    }
    static async addRefreshToken(userId: number, jti: string) {
        try {
            const pool: Pool = await getPool();
            return await pool.query(`
                INSERT INTO refresh_tokens (user_idfk, jti, expires_at)
                VALUES (?, ?, NOW() + INTERVAL 1 DAY)
                `, [userId, jti]
            );
        } catch (e) {
            throw e;
        }
    }
    static async getRefreshTokenByJti(jti: string) {
        try {
            const pool: Pool = await getPool();
            const result = await pool.query(`
                SELECT * FROM refresh_tokens
                WHERE jti = ? AND revoked = 0
                `, [jti]
            );
            if (result.length === 0) {
                return null;
            }
            return result[0];
        } catch (e) {
            throw e;
        }
    }
    static async revokeRefreshTokens(userId: number) {
        try {
            const pool: Pool = await getPool();
            return await pool.query(`
                UPDATE refresh_tokens
                SET revoked = 1
                WHERE user_idfk = ?
                `, [userId]
            );
        } catch (e) {
            throw e;
        }
    }
    static async getUser(email: string) {
        try {
            const pool: Pool = await getPool();
            const result = await pool.query(`
                SELECT * FROM users
                WHERE email = ?
                `, [email]
            );
            if (result.length === 0) {
                return null;
            }
            return result[0];
        } catch (e) {
            throw e;
        }
    }
    static async getUserById(id: number) {
        try {
            const pool: Pool = await getPool();
            const result = await pool.query(`
                SELECT * FROM users
                WHERE id = ?
                `, [id]
            );
            if (result.length === 0) {
                return null;
            }
            return result[0];
        } catch (e) {
            throw e;
        }
    }
}