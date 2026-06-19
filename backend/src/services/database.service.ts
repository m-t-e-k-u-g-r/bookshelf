import * as mariadb from 'mariadb';
import {type Pool} from 'mariadb';
import { ENV } from '../lib/env.js';

let pool: Pool | null = null;

async function createPool(): Promise<Pool> {
    if (pool) return pool;

    pool = mariadb.createPool({
        host: ENV.DB_HOST,
        port: 3306,
        user: ENV.MARIADB_USER,
        password: ENV.MARIADB_PASSWORD,
        database: ENV.MARIADB_DATABASE,
        connectionLimit: 10,
        bigIntAsNumber: true,
    });

    while (true) {
        try {
            const conn = await pool.getConnection();
            conn.release();
            break;
        } catch (err) {
            await new Promise(r => setTimeout(r, 3000));
        }
    }

    return pool;
}

export async function query(sql: string, params: any[] = []): Promise<any[]> {
    try {
        const pool = await getPool();
        return await pool.query(sql, params);
    } catch (err) {
        throw err;
    }
}

export async function getPool(): Promise<Pool> {
    return await createPool();
}