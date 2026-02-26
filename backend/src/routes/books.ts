import express from 'express';
import { type Request, type Response, type Router } from 'express';
import {addBook, type APIResponse, formatISBN, getBook} from '../lib/utils.js';
import {type Book, type ISBNList} from '../lib/dataManager.js';
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

const router: Router = express.Router();

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
    .get(async (req: Request, res: Response) => {
        // #swagger.tags = ['Books']
        // #swagger.parameters['sortBy'] = { $ref: '#/components/parameters/SortByParam' }
        // #swagger.parameters['order'] = { $ref: '#/components/parameters/OrderParam' }
        const data: Book[] = await DataManager.getBooks();
        let { sortBy, order, hide } = req.query;

        if (!Object.values(SortBy).includes(sortBy as SortBy)) {
            sortBy = SortBy.TITLE;
        }
        if (!Object.values(SortOrder).includes(order as SortOrder)) {
            order = SortOrder.ASC;
        }
        const sortedData: Book[] = sort(data, (sortBy as SortBy), order as SortOrder);

        const hiddenAttributes: string[] | undefined = (hide as string)?.split(',').map((f: any) => f.trim());
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
    const ISBNdata: ISBNList = await DataManager.getISBNs();
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
        const rawISBN = req.params.isbn;
        if (!rawISBN || typeof rawISBN !== 'string') {
            return res.status(400).json({error: 'Invalid ISBN'});
        }

        const validISBN: string | undefined = formatISBN(rawISBN);
        if (!validISBN) {
            return res.status(400).json({error: 'Invalid ISBN'});
        }

        let ISBNdata: ISBNList = await DataManager.getISBNs();
        const cleanISBN: string = validISBN.replace(/-/g, '');

        const alreadyExists: boolean = ISBNdata.some((i: string) => i.replace(/-/g, '') === cleanISBN);
        if (alreadyExists) {
            return res.status(409).json({error: `Book with ISBN '${cleanISBN}' already exists.`});
        }

        const response: APIResponse = await getBook(validISBN);
        if (response.status !== 200) {
            return res.status(response.status).json({error: response.error});
        }

        const entry: Book = response.data;

        ISBNdata = [...ISBNdata, cleanISBN];
        await DataManager.saveISBN(ISBNdata);

        const books: Book[] = await DataManager.getBooks();
        await DataManager.saveBooks([...books, entry]);

        return res.status(201).json({
            message: `Book '${entry.title}' added successfully`,
        });
    })
    .delete(async (req: Request, res: Response) => {
        // #swagger.tags = ['Books']
        let books: Book[] = await DataManager.getBooks();
        let ISBNdata: ISBNList = await DataManager.getISBNs();

        const rawISBN = req.params.isbn;
        if (!rawISBN || typeof rawISBN !== 'string') {
            return res.status(400).json({error: 'Invalid ISBN'});
        }
        const isbn: string = rawISBN.replace(/-/g, '');

        let found: boolean = false;

        if (ISBNdata.includes(isbn)) {
            ISBNdata = ISBNdata.filter((i: string) => i.replace(/-/g, '') !== isbn);
            await DataManager.saveISBN(ISBNdata);
            found = true;
        }

        const initialLength: number = books.length;
        books = books.filter((book: any) => book.isbn.replace(/-/g, '') !== isbn);

        if (books.length < initialLength) {
            await DataManager.saveBooks(books);
            found = true;
        }

        if (found) {
            res.sendStatus(204);
        } else {
            res.status(404).json({error: `Book '${isbn}' not found`});
        }
    });

export default router;