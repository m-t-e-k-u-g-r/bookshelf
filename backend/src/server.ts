import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname: string = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env')});
import express, {type Express} from 'express';
import { type Request, type Response } from 'express';
import { readFile } from 'node:fs/promises'
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
const swaggerPath = new URL('./swagger/swagger.json', import.meta.url);
const swaggerDoc = JSON.parse(await readFile(fileURLToPath(swaggerPath), 'utf8'));
import dbRouter from './routes/db_router.js';
import { DbDataManager as db} from "./lib/dbDataManager.js";

const PORT: string = process.env.PORT || '5500';
const app: Express = express();

const allowedOrigins: string[] = process.env.CORS_ORIGIN?.split(',') || [];
app.use(cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
}));
app.use(express.json());

app.get('/isbn', async (req: Request, res: Response) => {
    // #swagger.tags = ['ISBN']
    res.send(await db.getISBNs());
});
app.get('/isbn-h', async (req: Request, res: Response) => {
    // #swagger.tags = ['ISBN']
    res.send(await db.getFormatedISBNs());
})
app.use('/db', dbRouter);
app.use('/swagger-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.listen(PORT,
    () => console.log(`Server running on port ${PORT}.`)
);