import express from 'express';
import { type Request, type Response, type Router } from 'express';
import { type APIResponse, cleanIsbn, formatISBN, getBook, sort, SortBy, SortOrder} from '../lib/utils.js';
import {type Book, type ISBNList, type Shelves} from '../lib/dataManager.js';
import {DataManager} from "../lib/dataManager.js";


const router: Router = express.Router();

router.route('/')
    .get(async (req: Request, res: Response) => {
        // #swagger.tags = ['Books']
        // #swagger.parameters['sortBy'] = { $ref: '#/components/parameters/SortByParam' }
        // #swagger.parameters['order'] = { $ref: '#/components/parameters/OrderParam' }
        const books: Book[] = await DataManager.getBooks();
        let { sortBy, order, hide } = req.query;

        if (!Object.values(SortBy).includes(sortBy as SortBy)) {
            sortBy = SortBy.TITLE;
        }
        if (!Object.values(SortOrder).includes(order as SortOrder)) {
            order = SortOrder.ASC;
        }
        const sortedData: Book[] = sort(books, (sortBy as SortBy), order as SortOrder);

        const hiddenAttributes: string[] | undefined = (hide as string)?.split(',').map((f: string) => f.trim());
        if (hiddenAttributes !== undefined) {
            for (const attribute of hiddenAttributes as (keyof Book)[]) {
                sortedData.forEach((book: Book) => {
                    delete book[attribute]
                });
            }
        }

        res.status(200).send(sortedData);
    });

router.route('/reset').post(async (req: Request, res: Response) => {
    // #swagger.tags = ['Books']
    try {
        const bookCount: number = await DataManager.syncBooksWithAPI();
        return res.status(200).send(`${bookCount} books synchronized.`);
    } catch (e) {
        console.error('Error while synchronizing books:', e);
        return res.status(500).json({ error: 'Synchronization failed' });
    }
});

router.route('/:isbn')
    .get(async (req: Request, res: Response) => {
        // #swagger.tags = ['Books']
        const rawISBN = req.params.isbn;
        if (rawISBN == null) return res.status(400).json({error: 'Invalid ISBN'});
        if (typeof rawISBN !== 'string') return res.status(400).json({error: 'Invalid ISBN'});
        const isbn: string = cleanIsbn(rawISBN);

        const books: Book[] = await DataManager.getBooks();
        const book: Book | undefined = books.find((b: Book) => cleanIsbn(b.isbn) === isbn);
        if (book == undefined) return res.status(404).json({error: 'Book not found'});

        res.status(200).send(book);
    })
    .post(async (req: Request, res: Response) => {
        // #swagger.tags = ['Books']
        const rawISBN = req.params.isbn as string;
        if (!rawISBN) {
            return res.status(400).json({error: 'Invalid ISBN'});
        }

        const validISBN: string | undefined = formatISBN(rawISBN);
        if (!validISBN) {
            return res.status(400).json({error: 'Invalid ISBN'});
        }

        let ISBNdata: ISBNList = await DataManager.getISBNs();
        const cleanISBN: string = validISBN.replace(/-/g, '');

        const alreadyExists: boolean = ISBNdata.some((i: string) => cleanIsbn(i) === cleanISBN);
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
        let shelves: Shelves = await DataManager.getShelves();

        const rawISBN = req.params.isbn;
        if (!rawISBN || typeof rawISBN !== 'string') {
            return res.status(400).json({error: 'Invalid ISBN'});
        }
        const isbn: string = cleanIsbn(rawISBN);

        let found: boolean = false;

        if (ISBNdata.includes(isbn)) {
            ISBNdata = ISBNdata.filter((i: string) => cleanIsbn(i) !== isbn);
            await DataManager.saveISBN(ISBNdata);
            found = true;
        }

        const initialLength: number = books.length;
        books = books.filter((book: Book) => cleanIsbn(book.isbn) !== isbn);

        if (books.length < initialLength) {
            await DataManager.saveBooks(books);
            found = true;
        }

        Object.keys(shelves).forEach(key => {
            const shelf: ISBNList | undefined = shelves[key];
            if (shelf !== undefined) {
                shelves[key] = shelf.filter((i: string) => cleanIsbn(i) !== isbn);
            }
        });
        await DataManager.saveShelves(shelves);

        if (found) {
            res.sendStatus(204);
        } else {
            res.status(404).json({error: `Book '${isbn}' not found`});
        }
    });

export default router;