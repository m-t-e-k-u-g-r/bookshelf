import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname: string = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env')});
const requiredEnv = [
    'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET',
    'MARIADB_USER', 'MARIADB_PASSWORD', 'MARIADB_DATABASE',
    'CORS_ORIGIN', 'DB_HOST'
];
const missingEnv = requiredEnv.filter(env => !process.env[env]);
if (missingEnv.length > 0) {
    console.error(`Missing environment variables: ${missingEnv.join(', ')}`);
    process.exit(1);
}

export const ENV = {
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
    MARIADB_USER: process.env.MARIADB_USER!,
    MARIADB_PASSWORD: process.env.MARIADB_PASSWORD!,
    MARIADB_DATABASE: process.env.MARIADB_DATABASE!,
    CORS_ORIGIN: process.env.CORS_ORIGIN!,
    DB_HOST: process.env.DB_HOST!,
}
