import * as mariadb from 'mariadb';
import {type Pool, type PoolConnection} from 'mariadb';

let pool: Pool | null = null;
function getPool(): Pool {
    if (!pool) {
        pool = mariadb.createPool({
            host: 'localhost',
            user: process.env.MARIADB_USER || '',
            password: process.env.MARIADB_PASSWORD || '',
            database: process.env.MARIADB_DATABASE || '',
            connectionLimit: 10,
        });
    }
    return pool;
}

export interface Book {
    isbn: string;
    isbn_h: string;
    title: string;
    author: string;
    publish_date: string;
    imgUrl: string;
}

export interface BookInShelf extends Book {
    shelf: string;
}

export type ISBNList = string[]

export interface SidebarData {
    name: string;
    count: number;
}

export class DbDataManager {
    static async getBooks(): Promise<Book[]> {
        try {
            return await getPool().query(`SELECT * FROM books`);
        } catch (e) {
            throw e;
        }
    }
    static async getBookByISBN(isbn: string): Promise<Book> {
        try {
            return await getPool().query(`
                SELECT * FROM books 
                WHERE isbn = ?
                `, [isbn]
            );
        } catch (e) {
            throw e;
        }
    }
    static async addBook(book: Book) {
        try {
            return await getPool().query(`
                INSERT INTO books (isbn, isbn_h, title, author, publish_year, img_url) 
                VALUES (?, ?, ?, ?, ?, ?)
                `, [book.isbn, book.isbn_h, book.title, book.author, book.publish_date, book.imgUrl]
            );
        } catch (e) {
            throw e;
        }
    }
    static async addBatch(books: Book[]) {
        const connection: PoolConnection = await getPool().getConnection();
        try {
            await connection.beginTransaction();

            for (const book of books) {
                await connection.query(`
                    INSERT INTO books (isbn, isbn_h, title, author, publish_year, img_url) 
                    VALUES (?, ?, ?, ?, ?, ?)
                    `, [book.isbn, book.isbn_h, book.title, book.author, book.publish_date, book.imgUrl]
                );
            }
            await connection.commit();
        } catch (e) {
            await connection.rollback();
            throw e;
        } finally {
            connection.release();
        }
    }
    static async deleteBook(isbn: string) {
        try {
            return await getPool().query(`
                DELETE FROM books 
                WHERE isbn = ?
                `, [isbn]
            );
        } catch (e) {
            throw e;
        }
    }
    static async getISBNs(): Promise<ISBNList> {
        try {
            const result: Book[] = await getPool().query(`SELECT isbn FROM books`);
            return result.map((row: Book) => row.isbn);
        } catch (e) {
            throw e;
        }
    }
    static async getFormatedISBNs(): Promise<ISBNList> {
        try {
            const result = await getPool().query(`SELECT isbn_h FROM books`);
            return result.map((row: Book) => row.isbn_h);
        } catch (e) {
            throw e;
        }
    }
    static async getShelvesWithBooks(): Promise<BookInShelf[]> {
        try {
            return await getPool().query(`SELECT * FROM books_in_shelves`);
        } catch (e) {
            throw e;
        }
    }
    static async getShelvesOfBook(isbn: string): Promise<string[]> {
        try {
            const result = await getPool().query(`
                SELECT iis.name AS shelf
                FROM isbns_in_shelves iis
                WHERE iis.isbn = ?
                `, [isbn]
            );
            return result.map((row: { shelf: string }) => row.shelf);
        } catch (e) {
            throw e;
        }
    }
    static async getBooksByShelf(shelfName: string): Promise<BookInShelf[]> {
        try {
            return await getPool().query(`
            SELECT * FROM books_in_shelves
            WHERE shelf = ?
            `, [shelfName])
        } catch (e) {
            throw e;
        }
    }
    static async getSidebarData(): Promise<SidebarData[]> {
        try {
            return await getPool().query(`SELECT * FROM sidebar_data`);
        } catch (e) {
            throw e;
        }
    }
    static async addShelf(shelfName: string) {
        try {
            return await getPool().query(`
                INSERT INTO shelves (name) 
                VALUES (?)
                `, [shelfName]
            );
        } catch (e) {
            throw e;
        }
    }
    static async updateShelfName(oldName: string, newName: string) {
        try {
            return await getPool().query(`
                UPDATE shelves 
                SET name = ?
                WHERE name = ?
                `, [newName, oldName]
            );
        } catch (e) {
            throw e;
        }
    }
    static async deleteShelf(shelfName: string) {
        try {
            return await getPool().query(`
                DELETE FROM shelves 
                WHERE name = ?
                `, [shelfName]
            )
        } catch (e) {
            throw e;
        }
    }
    static async editShelvesOfBook(isbn: string, shelves: string[]) {
        const connection: PoolConnection = await getPool().getConnection();
        try {
            await connection.beginTransaction();

            await connection.query(`
                DELETE FROM shelves_books 
                WHERE book_isbn = ?
                `, [isbn]
            );

            for (const shelf of shelves) {
                await connection.query(`
                    INSERT INTO shelves_books (shelf_id, book_isbn) 
                    VALUES (?, ?)
                    `, [shelf, isbn]
                )
            }
            return await connection.commit();
        } catch (e) {
            await connection.rollback();
            throw e;
        } finally {
            connection.release();
        }
    }
}