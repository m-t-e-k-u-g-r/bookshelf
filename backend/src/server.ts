import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname: string = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env')});
const requiredEnv = [
    'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET',
    'MARIADB_USER', 'MARIADB_PASSWORD', 'MARIADB_DATABASE',
    'CORS_ORIGIN'
];
const missingEnv = requiredEnv.filter(env => !process.env[env]);
if (missingEnv.length > 0) {
    console.error(`Missing environment variables: ${missingEnv.join(', ')}`);
    process.exit(1);
}
import express, {type Express} from 'express';
import { type Request, type Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiRouter from "./routes/api_router.js";

const PORT: string = process.env.PORT || '5500';
const app: Express = express();

const allowedOrigins: string[] = process.env.CORS_ORIGIN?.split(',') || [];
app.use(cookieParser());
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../dist/frontend')));

app.get('/', async (req: Request, res: Response) => {
    // #swagger.ignore = true
    res.sendFile(path.join(__dirname, '../../dist/frontend', 'index.html'));
});
app.use('/api', apiRouter);

app.listen(PORT,
    () => console.log(`Server running on port ${PORT}.`)
);