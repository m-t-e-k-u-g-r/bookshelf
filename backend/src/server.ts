import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname: string = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env')});
import express, {type Express} from 'express';
import { type Request, type Response } from 'express';
import cors from 'cors';
import apiRouter from "./routes/api_router.js";

const PORT: string = process.env.PORT || '5500';
const app: Express = express();

const allowedOrigins: string[] = process.env.CORS_ORIGIN?.split(',') || [];
app.use(cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../dist/frontend')));

app.get('/', async (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../dist/frontend', 'index.html'));
});
app.use('/api', apiRouter);

app.listen(PORT,
    () => console.log(`Server running on port ${PORT}.`)
);