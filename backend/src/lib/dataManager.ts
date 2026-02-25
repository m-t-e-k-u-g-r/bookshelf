import * as fs from 'fs/promises';
import * as path from 'path';

const DATA_DIR: string = path.join(process.cwd(), 'data');
const BOOKS_FILE: string = path.join(DATA_DIR, 'books.json');
const ISBN_FILE: string = path.join(DATA_DIR, 'isbn.json');
const SHELVES_FILE: string = path.join(DATA_DIR, 'shelves.json');

export class DataManager {
    static async getISBNs() {
        const data: string = await fs.readFile(ISBN_FILE, 'utf-8');
        return JSON.parse(data);
    }

    static async getBooks() {
        const data: string = await fs.readFile(BOOKS_FILE, 'utf-8');
        return JSON.parse(data);
    }

    static async getShelves() {
        const data: string = await fs.readFile(SHELVES_FILE, 'utf-8');
        return JSON.parse(data);
    }

    static async saveISBN(content: any) {
        const file_data: string = JSON.stringify(content, null, 2);
        await fs.writeFile(ISBN_FILE, file_data);
    }

    static async saveBooks(content: any) {
        const file_data: string = JSON.stringify(content, null, 2);
        await fs.writeFile(BOOKS_FILE, file_data);
    }

    static async saveShelves(content: any) {
        const file_data: string = JSON.stringify(content, null, 2);
        await fs.writeFile(SHELVES_FILE, file_data);
    }
}