import * as fs from 'fs/promises';
import * as path from 'path';
import {addBook, type APIResponse} from "./utils.js";

const DATA_DIR: string = path.join(process.cwd(), 'data');
const BOOKS_FILE: string = path.join(DATA_DIR, 'books.json');
const ISBN_FILE: string = path.join(DATA_DIR, 'isbn.json');
const SHELVES_FILE: string = path.join(DATA_DIR, 'shelves.json');

export interface Book {
    isbn: string;
    title: string;
    author: string;
    publish_date: string;
    imgUrl: string | undefined;
}

export interface Shelves {
    [shelfName: string]: ISBNList;
}

export type ISBNList = string[];

export class DataManager {
    static async syncBooksWithAPI(): Promise<number> {
        const ISBNdata: ISBNList = await DataManager.getISBNs();
        let books: Book[] = [];
        for (const isbn of ISBNdata) {
            const response: APIResponse = await addBook(isbn, books);
            if (response.status === 201 && response.data) {
                books = [...books, response.data];
            }
        }
        await DataManager.saveBooks(books);
        return books.length;
    }

    private static async readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
        try {
            const data: string = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data) as T;
        } catch (e) {
            console.error('Failed to read JSON file:', e);
            return fallback;
        }
    }

    static async getISBNs(): Promise<ISBNList> {
        return this.readJsonFile(ISBN_FILE, []);
    }

    static async getBooks(): Promise<Book[]> {
        return this.readJsonFile(BOOKS_FILE, []);
    }

    static async getShelves(): Promise<Shelves> {
        return this.readJsonFile(SHELVES_FILE, {});
    }

    private static async saveJsonFile<T>(filePath: string, content: T): Promise<void> {
        const file_data: string = JSON.stringify(content, null, 2);
        await fs.writeFile(filePath, file_data);
    }

    static async saveISBN(content: ISBNList): Promise<void> {
        await this.saveJsonFile(ISBN_FILE, content);
    }

    static async saveBooks(content: Book[]): Promise<void> {
        await this.saveJsonFile(BOOKS_FILE, content);
    }

    static async saveShelves(content: Shelves): Promise<void> {
        await this.saveJsonFile(SHELVES_FILE, content);
    }
}