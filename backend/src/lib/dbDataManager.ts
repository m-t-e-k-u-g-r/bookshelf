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
    static async getISBNs() {
        try {
            return await pool.query(`SELECT isbn FROM books`);
        } catch (e) {
            throw e;
        }
    }
    static async getFormatedISBNs() {
        try {
            return await pool.query(`SELECT isbn_h FROM books`);
        } catch (e) {
            throw e;
        }
    }
    static async getShelvesWithBooks() {
        try {
            return await pool.query(`SELECT * FROM books_in_shelves`);
        } catch (e) {
            throw e;
        }
    }
    static async getBooksByShelf(shelfName: string) {
        try {
            return await pool.query(`
            SELECT * FROM books_in_shelves
            WHERE shelf = ?
            `, [shelfName])
        } catch (e) {
            throw e;
        }
    }
    static async getShelfStats() {
        try {
            return await pool.query(`SELECT * FROM shelf_statistics`);
        } catch (e) {
            throw e;
        }
    }
    static async getSidebarData() {
        try {
            return await pool.query(`SELECT * FROM sidebar_data`);
        } catch (e) {
            throw e;
        }
    }
    static async addShelf(shelfName: string) {
        try {
            return await pool.query(`
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
            return await pool.query(`
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
            return await pool.query(`
                DELETE FROM shelves 
                WHERE name = ?
                `, [shelfName]
            )
        } catch (e) {
            throw e;
        }
    }
}