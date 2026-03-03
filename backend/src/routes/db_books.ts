import express from 'express';
import { type Router, type Request, type Response } from "express";
import { DbDataManager as db, type Book } from '../lib/dbDataManager.js';
import {sortDb, SortBy, SortOrder, cleanIsbn, formatISBN, type APIResponse, getBook} from '../lib/utils.js';

const router: Router = express.Router();

router.route('/')
    .get(async (req: Request, res: Response) => {
        // #swagger.tags = ['DB Books']
        // #swagger.parameters['sortBy'] = { $ref: '#/components/parameters/SortByParam' }
        // #swagger.parameters['order'] = { $ref: '#/components/parameters/OrderParam' }
        const books: Book[] = await db.getBooks();
        let { sortBy, order, hide } = req.query;

        if (!Object.values(SortBy).includes(sortBy as SortBy)) {
            sortBy = SortBy.TITLE;
        }
        if (!Object.values(SortOrder).includes(order as SortOrder)) {
            order = SortOrder.ASC;
        }

        const sortedBooks: Book[] = sortDb(books, (sortBy as SortBy), order as SortOrder);
        const hiddenAttributes: string[] | undefined = (hide as string)?.split(',').map((f: string) => f.trim());
        if (hiddenAttributes !== undefined) {
            for (const attribute of hiddenAttributes as (keyof Book)[]) {
                sortedBooks.forEach((book: Book) => {
                    delete book[attribute]
                });
            }
        }

        return res.status(200).send(books);
    });

router.route('/batch').post(async (req: Request, res: Response) => {
    // #swagger.tags = ['DB Books']
    const isbns: string[] = req.body.isbns;
    let booksToAdd: Book[] = [];
    let added: number = 0;
    const cleanIsbns: string[] = isbns
        .map(cleanIsbn)
        .map(formatISBN)
        .filter((isbn: string | undefined): isbn is string => isbn !== undefined);

    for (const isbn of cleanIsbns) {
        const response: APIResponse = await getBook(isbn);
        if (response.status !== 200) {

            continue;
        }
        const entry: Book = response.data;
        booksToAdd.push(entry);
        added ++;
    }
    const invalid: number = isbns.length - added;
    try {
        await db.addBatch(booksToAdd);
    } catch (e) {
        console.error('Error while adding books:', e);
        return res.status(500).json({ error: 'Failed to add books' });
    }
    return res.status(201).json({
        message: `Added ${added} books, ${invalid} invalid ISBNs`,
    });
});

router.route('/:isbn')
    .get(async (req: Request, res: Response) => {
        // #swagger.tags = ['DB Books']
        const isbn = req.params.isbn;
        if (isbn == null) return res.status(400).json({error: 'Invalid ISBN'});
        if (typeof isbn == 'string') {
            const book: Book = await db.getBookByISBN(isbn);
            return res.status(200).send(book);
        } else {
            let books: Book[] = [];
            for (const i of isbn) {
                const book: Book = await db.getBookByISBN(i);
                books.push(book);
            }
            return res.status(200).send(books);
        }
    })
    .post(async (req: Request, res: Response) => {
        // #swagger.tags = ['DB Books']
        const isbn = req.params.isbn;
        if (typeof isbn !== 'string') return res.status(400).json({error: 'Invalid ISBN'});

        const validISBN: string | undefined = formatISBN(isbn);
        if (validISBN == undefined) return res.status(400).json({error: 'Invalid ISBN'});

        const response: APIResponse = await getBook(validISBN);
        if (response.status !== 200) {
            return res.status(response.status).json({error: response.error});
        }

        const entry: Book = response.data;
        try {
            await db.addBook(entry);
            return res.status(201).json({
                message: `Book '${entry.title}' added successfully`,
            });
        } catch (e) {
            return res.status(500).json({ error: 'Failed to add book' });
        }
    })
    .delete(async (req: Request, res: Response) => {
        // #swagger.tags = ['DB Books']
        const isbn = req.params.isbn;
        if (typeof isbn !== 'string') return res.status(400).json({error: 'Invalid ISBN'});

        try {
            await db.deleteBook(isbn);
            return res.sendStatus(204);
        } catch (e) {
            return res.status(500).json({ error: 'Failed to delete book' });
        }
    })

export default router;