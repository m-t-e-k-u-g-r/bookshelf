import * as mariadb from 'mariadb';
import { type Pool } from 'mariadb';

const pool: Pool = mariadb.createPool({
    host: 'localhost',
    user: process.env.MARIADB_USER || '',
    password: process.env.MARIADB_PASSWORD || '',
    database: process.env.MARIADB_DATABASE || '',
    connectionLimit: 10,
});

export class DbDataManager {
    static async getBooks() {
        try {
            return await pool.query(`SELECT * FROM books`);
        } catch (e) {
            throw e;
        }
    }
    static async getBookByISBN(isbn: string) {
        try {
            return await pool.query(`
                SELECT * FROM books 
                WHERE isbn = ?
                `, [isbn]
            );
        } catch (e) {
            throw e;
        }
    }
    static async addBook(isbn: string, isbn_h: string, title: string, author: string, publish_year: number, img_url: string) {
        try {
            return await pool.query(`
                INSERT INTO books (isbn, isbn_h, title, author, publish_year, img_url) 
                VALUES (?, ?, ?, ?, ?, ?)
                `, [isbn, isbn_h, title, author, publish_year, img_url]
            );
        } catch (e) {
            throw e;
        }
    }
    static async deleteBook(isbn: string) {
        try {
            return await pool.query(`
                DELETE FROM books 
                WHERE isbn = ?
                `, [isbn]
            );
        } catch (e) {
            throw e;
        }
    }
}