import express from "express";
import { type Router } from "express";
import booksRouter from "./db_books.js";
import shelvesRouter from "./db_shelves.js";

const router: Router = express.Router();

router.use('/books', booksRouter);
router.use('/shelves', shelvesRouter);

export default router;