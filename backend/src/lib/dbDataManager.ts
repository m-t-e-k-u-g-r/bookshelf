import * as mariadb from 'mariadb';
import { type Pool } from 'mariadb';

const pool: Pool = mariadb.createPool({
    host: 'localhost',
    user: process.env.MARIADB_USER || '',
    password: process.env.MARIADB_PASSWORD || '',
    database: process.env.MARIADB_DATABASE || '',
    connectionLimit: 10,
});