import * as mariadb from 'mariadb';
import {type Pool, type PoolConnection} from 'mariadb';

let pool: Pool | null = null;

async function createPool(): Promise<Pool> {
    if (pool) return pool;

    pool = mariadb.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: 3306,
        user: process.env.MARIADB_USER || '',
        password: process.env.MARIADB_PASSWORD || '',
        database: process.env.MARIADB_DATABASE || '',
        connectionLimit: 10,
        bigIntAsNumber: true,
    });

    while (true) {
        try {
            const conn = await pool.getConnection();
            conn.release();
            break;
        } catch (err) {
            await new Promise(r => setTimeout(r, 3000));
        }
    }

    return pool;
}

export async function getPool(): Promise<Pool> {
    const pool: Pool = await createPool();
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
            const pool: Pool = await getPool();
            return await pool.query(`SELECT * FROM books`);
        } catch (e) {
            throw e;
        }
    }
    static async getBookByISBN(isbn: string): Promise<Book | undefined> {
        try {
            const pool: Pool = await getPool();
            const result = pool.query(`
                SELECT * FROM books 
                WHERE isbn = ?
                `, [isbn]
            );
            if (!Array.isArray(result) || result.length === 0) {
                return undefined;
            }
            return result[0] as Book;
        } catch (e) {
            throw e;
        }
    }
    static async addBook(book: Book) {
        try {
            const pool: Pool = await getPool();
            return await pool.query(`
                INSERT INTO books (isbn, isbn_h, title, author, publish_year, img_url)
                VALUES (?, ?, ?, ?, ?, ?)
                `, [book.isbn, book.isbn_h, book.title, book.author, book.publish_date, book.imgUrl]
            );
        } catch (e: any) {
            if (e.errno === 1062) {
                throw new Error('BOOK_ALREADY_EXISTS');
            }
            throw e;
        }
    }
    static async addBatch(books: Book[]) {
        const pool: Pool = await getPool();
        const connection: PoolConnection = await pool.getConnection();
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
        } catch (e: any) {
            await connection.rollback();
            if (e.errno === 1062) {
                throw new Error('BOOK_ALREADY_EXISTS');
            }
            throw e;
        } finally {
            connection.release();
        }
    }
    static async deleteBook(isbn: string) {
        const pool: Pool = await getPool();
        try {
            return pool.query(`
                DELETE FROM books 
                WHERE isbn = ?
                `, [isbn]
            );
        } catch (e) {
            throw e;
        }
    }
    static async getISBNs(): Promise<ISBNList> {
        const pool: Pool = await getPool();
        try {
            const result: Book[] = await pool.query(`SELECT isbn FROM books`);
            return result.map((row: Book) => row.isbn);
        } catch (e) {
            throw e;
        }
    }
    static async getFormatedISBNs(): Promise<ISBNList> {
        const pool: Pool = await getPool();
        try {
            const result = await pool.query(`SELECT isbn_h FROM books`);
            return result.map((row: Book) => row.isbn_h);
        } catch (e) {
            throw e;
        }
    }
    static async getShelfNames(): Promise<string[]> {
        const pool: Pool = await getPool();
        try {
            const result = await pool.query(`SELECT name FROM shelves`);
            return result.map((row: { name: string }) => row.name);
        } catch (e) {
            throw e;
        }
    }
    static async getShelvesWithBooks(): Promise<BookInShelf[]> {
        const pool: Pool = await getPool();
        try {
            return pool.query(`SELECT * FROM books_in_shelves`);
        } catch (e) {
            throw e;
        }
    }
    static async getShelvesOfBook(isbn: string): Promise<string[] | undefined> {
        const pool: Pool = await getPool();
        try {
            const result = await pool.query(`
                SELECT iis.name AS shelf
                FROM isbns_in_shelves iis
                WHERE iis.isbn = ?
                `, [isbn]
            );
            const rows: string[] = Array.isArray(result) ? result : [result];
            console.log(rows);
            if (rows.length === 0) {
                return [];
            }
            return rows.map(row=> row.shelf);
        } catch (e) {
            throw e;
        }
    }
    static async getBooksByShelf(shelfName: string): Promise<BookInShelf[]> {
        const pool: Pool = await getPool();
        try {
            return pool.query(`
            SELECT * FROM books_in_shelves
            WHERE shelf = ?
            `, [shelfName])
        } catch (e) {
            throw e;
        }
    }
    static async getSidebarData(): Promise<SidebarData[]> {
        const pool: Pool = await getPool();
        try {
            return pool.query(`SELECT * FROM sidebar_data`);
        } catch (e) {
            throw e;
        }
    }
    static async addShelf(shelfName: string) {
        const pool: Pool = await getPool();
        try {
            return pool.query(`
                INSERT INTO shelves (name) 
                VALUES (?)
                `, [shelfName]
            );
        } catch (e) {
            throw e;
        }
    }
    static async updateShelfName(oldName: string, newName: string) {
        const pool: Pool = await getPool();
        try {
            return pool.query(`
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
        const pool: Pool = await getPool();
        try {
            return pool.query(`
                DELETE FROM shelves 
                WHERE name = ?
                `, [shelfName]
            )
        } catch (e) {
            throw e;
        }
    }
    static async editShelvesOfBook(isbn: string, shelves: string[]) {
        const pool: Pool = await getPool();
        const connection: PoolConnection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            await connection.query(`
                DELETE FROM shelves_books 
                WHERE book_isbn = ?
                `, [isbn]
            );

            for (const shelf of shelves) {
                const [rows] = await connection.query(`SELECT id FROM shelves WHERE name = ?`, [shelf]);
                const shelfId: number = rows.id;
                await connection.query(`
                    INSERT INTO shelves_books (shelf_id, book_isbn) 
                    VALUES (?, ?)
                    `, [shelfId, isbn]
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