import express from "express";
import { type Router, type Request, type Response } from "express";
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import dbRouter from "./db_router.js";
import { DbDataManager as db} from "../lib/dbDataManager.js";
import swaggerUi from 'swagger-ui-express';
const swaggerPath = new URL('../swagger/swagger.json', import.meta.url);
const swaggerDoc = JSON.parse(await readFile(fileURLToPath(swaggerPath), 'utf8'));

const router: Router = express.Router();

router.get('/isbn', async (req: Request, res: Response) => {
    // #swagger.tags = ['ISBN']
    res.send(await db.getISBNs());
});
router.get('/isbn-h', async (req: Request, res: Response) => {
    // #swagger.tags = ['ISBN']
    res.send(await db.getFormatedISBNs());
})
router.use('/db', dbRouter);
router.use('/swagger-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

export default router;