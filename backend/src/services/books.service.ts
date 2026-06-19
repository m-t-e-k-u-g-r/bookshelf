import type {Pool, PoolConnection} from "mariadb";
import {getPool} from "./database.service.js";
import type {Book} from "../types/book.js";

export class BooksService {
    static async getBooks(userId: number): Promise<Book[]> {
        try {
            const pool: Pool = await getPool();
            return await pool.query(`
                SELECT b.*, ub.read_status
                FROM books b
                JOIN user_book ub ON b.isbn = ub.isbn
                WHERE ub.user_id = ?;
                `, [userId]
            );
        } catch (e) {
            throw e;
        }
    }
    static async getBookByISBN(isbn: string): Promise<Book | undefined> {
        try {
            const pool: Pool = await getPool();
            const result = await pool.query(`
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
    static async assignBook(isbn: string, userId: number) {
        const pool: Pool = await getPool();
        try {
            await pool.query(`
                INSERT INTO user_book (user_id, isbn)
                VALUES (?, ?)
                `, [userId, isbn]
            );
        } catch (e) {
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
    static async unassignBook(isbn: string, userId: number) {
        const pool: Pool = await getPool();
        try {
            return pool.query(`
                DELETE FROM user_book
                WHERE isbn = ? AND user_id = ?
                `, [isbn, userId]
            );
        } catch (e) {
            throw e;
        }
    }
}