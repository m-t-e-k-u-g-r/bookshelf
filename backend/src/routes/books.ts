import express from 'express';
import { type Request, type Response } from 'express';
import {addBook, type APIResponse, type Book, formatISBN, getBook} from '../lib/utils.js';
import {DataManager} from "../lib/dataManager.js";

enum SortBy {
    TITLE = 'title',
    AUTHOR = 'author',
    ISBN = 'isbn',
    PUBLISH_DATE = 'publish_date'
}
enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}

const router = express.Router();

function sort(data: Book[], sortBy: SortBy, order: SortOrder): Book[] {
    return [...data].sort((a: any, b: any) => {
        const valA = String(a[sortBy] || '');
        const valB = String(b[sortBy] || '');
        if (order === SortOrder.ASC) {
            return valA.localeCompare(valB);
        } else {
            return valB.localeCompare(valA);
        }
    });
}

router.route('/')
    .get(async (req: any, res: any) => {
        // #swagger.tags = ['Books']
        // #swagger.parameters['sortBy'] = { $ref: '#/components/parameters/SortByParam' }
        // #swagger.parameters['order'] = { $ref: '#/components/parameters/OrderParam' }
        const data = await DataManager.getBooks();
        let { sortBy, order, hide } = req.query;

        if (!Object.values(SortBy).includes(sortBy as SortBy)) {
            sortBy = SortBy.TITLE;
        }
        if (!Object.values(SortOrder).includes(order as SortOrder)) {
            order = SortOrder.ASC;
        }
        const sortedData = sort(data, sortBy, order);

        const hiddenAttributes: string[] | undefined = hide?.split(',').map((f: any) => f.trim());
        if (hiddenAttributes !== undefined) {
            for (const attribute of hiddenAttributes) {
                sortedData.forEach((book: any) => delete book[attribute]);
            }
        }

        res.status(200).send(sortedData);
    });

router.route('/reset').post(async (req: Request, res: Response) => {
    // #swagger.tags = ['Books']
    let data: any[] = [];
    const ISBNdata = await DataManager.getISBNs();
    for (const isbn of ISBNdata) {
        const response: APIResponse = await addBook(isbn, data);
        if (response.status === 201) {
            const book: Book = response.data;
            if (book) data = [...data, book];
        } else {
            console.log(response);
        }
    }
    await DataManager.saveBooks(data);
    const bookCount: number = data.length;
    res.status(200).send(`${bookCount} books synchronized.`);
});

router.route('/:isbn')
    .get(async (req: Request, res: Response) => {
        // #swagger.tags = ['Books']
        const rawISBN = req.params.isbn;
        if (rawISBN == null) return res.status(400).json({error: 'Invalid ISBN'});
        if (typeof rawISBN !== 'string') return res.status(400).json({error: 'Invalid ISBN'});
        const isbn: string = rawISBN.replace(/-/g, '');

        const data: Book[] = await DataManager.getBooks();
        const book: Book | undefined = data.find((b: any) => b.isbn.replace(/-/g, '') === isbn);
        if (book == undefined) return res.status(404).json({error: 'Book not found'});

        res.status(200).send(book);
    })
    .post(async (req: Request, res: Response) => {
        // #swagger.tags = ['Books']
        let ISBNdata = await DataManager.getISBNs();
        const rawISBN = req.params.isbn;
        if (rawISBN == null) return res.status(400).json({error: 'Invalid ISBN'});
        if (typeof rawISBN !== 'string') return res.status(400).json({error: 'Invalid ISBN'});

        const response: APIResponse = await getBook(rawISBN);
        if (response.status !== 200) return res.status(response.status).json({error: response.error});
        const entry: Book = response.data;

        const cleanIsbn: string = rawISBN.replace(/-/g, '');

        if (!ISBNdata.includes(cleanIsbn)) {
            const formattedIsbn: string | undefined = formatISBN(cleanIsbn);
            const isbn: string = formattedIsbn !== undefined ? formattedIsbn : cleanIsbn;
            ISBNdata = [...ISBNdata, isbn];
            await DataManager.saveISBN(ISBNdata);
            res.status(201).json({message: `Book '${entry.title}' by '${entry.author}' added to sync list`});
        } else {
            res.status(200).json({message: 'Book already in list'});
        }
    })
    .delete(async (req: Request, res: Response) => {
        // #swagger.tags = ['Books']
        let data = await DataManager.getBooks();
        let ISBNdata = await DataManager.getISBNs();
        const rawISBN = req.params.isbn;
        if (rawISBN == null) return res.status(400).json({error: 'Invalid ISBN'});
        if (typeof rawISBN !== 'string') return res.status(400).json({error: 'Invalid ISBN'});
        const isbn: string = rawISBN.replace(/-/g, '');

        let found: boolean = false;

        if (ISBNdata.includes(isbn)) {
            ISBNdata = ISBNdata.filter((i: string) => i.replace(/-/g, '') !== isbn);
            await DataManager.saveISBN(ISBNdata);
            found = true;
        }

        const initialLength: number = data.length;
        data = data.filter((book: any) => book.isbn.replace(/-/g, '') !== isbn);

        if (data.length < initialLength) {
            await DataManager.saveBooks(data);
            found = true;
        }

        if (found) {
            res.sendStatus(204);
        } else {
            res.status(404).json({error: `Book '${isbn}' not found`});
        }
    });

export default router;