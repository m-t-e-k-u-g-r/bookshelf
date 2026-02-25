import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import booksRouter from './routes/books.js';
import shelvesRouter from './routes/shelves.js';
import { addBook, type Book, type APIResponse} from './lib/utils.js';
import { DataManager } from "./lib/dataManager.js";

const ISBNdata = await DataManager.getISBNs();
let books = await DataManager.getBooks();
let hasChanges = false;

const PORT: string = process.env.PORT || '5500';
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
}));
app.use(express.json());

app.get('/isbn', (req, res) => res.send(ISBNdata));
app.use('/books', booksRouter);
app.use('/shelves', shelvesRouter);

app.listen(PORT,
    () => console.log(`Server running on port ${PORT}.`)
);

for (const isbn of ISBNdata) {
    if (books.find((b: any) => b.isbn === isbn)) continue;

    const response: APIResponse = await addBook(isbn, books);
    if (response.status !== 201 && response.data) {
        const newBook: Book = response.data;
        books.push(newBook);
        hasChanges = true;
    }
}

if (hasChanges) {
    await DataManager.saveBooks(books);
}