import express from "express";
import { type Router } from "express";
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import dbRouter from "./db_router.js";
import authRouter from "./auth_router.js";
import swaggerUi from 'swagger-ui-express';
const swaggerPath = new URL('../swagger/swagger.json', import.meta.url);
const swaggerDoc = JSON.parse(await readFile(fileURLToPath(swaggerPath), 'utf8'));

const router: Router = express.Router();

router.use('/db', dbRouter);
router.use('/auth', authRouter);
router.use('/swagger-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

export default router;