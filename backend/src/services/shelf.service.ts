import type {BookInShelf} from "../types/book.js";
import type {ShelfOfBook, SidebarData} from "../types/shelf.js";
import type {Pool, PoolConnection} from "mariadb";
import {getPool} from "./database.service.js";

export class ShelfService {
    static async getShelfNames(userId: number): Promise<string[]> {
        const pool: Pool = await getPool();
        try {
            const result = await pool.query(`
                SELECT name FROM shelves
                WHERE user_id = ?
                `, [userId]
            );
            return result.map((row: { name: string }) => row.name);
        } catch (e) {
            throw e;
        }
    }
    static async getShelvesWithBooks(userId: number): Promise<BookInShelf[]> {
        const pool: Pool = await getPool();
        try {
            return pool.query(`
                SELECT * FROM books_in_shelves
                WHERE user_id = ?
                `, [userId]
            );
        } catch (e) {
            throw e;
        }
    }
    static async getShelvesOfBook(isbn: string, userId: number): Promise<string[] | undefined> {
        const pool: Pool = await getPool();
        try {
            const result: ShelfOfBook[] = await pool.query<ShelfOfBook[]>(`
                SELECT iis.shelf AS shelf
                FROM isbns_in_shelves iis
                WHERE iis.isbn = ? AND iis.user_id = ?
                `, [isbn, userId]
            );
            const rows: ShelfOfBook[] = Array.isArray(result) ? result : [result];
            console.log(rows);
            if (rows.length === 0) {
                return [];
            }
            return rows.map((row: ShelfOfBook)=> row.shelf);
        } catch (e) {
            throw e;
        }
    }
    static async getBooksByShelf(shelfName: string, userId: number): Promise<BookInShelf[]> {
        const pool: Pool = await getPool();
        try {
            return pool.query(`
                SELECT * FROM books_in_shelves
                WHERE shelf = ? AND user_id = ?
                `, [shelfName, userId]
            )
        } catch (e) {
            throw e;
        }
    }
    static async getSidebarData(userId: number): Promise<SidebarData[]> {
        const pool: Pool = await getPool();
        try {
            return pool.query(`
                SELECT sd.* FROM sidebar_data sd
                WHERE sd.user_id = ?
                `, [userId]
            );
        } catch (e) {
            throw e;
        }
    }
    static async addShelf(shelfName: string, userId: number) {
        const pool: Pool = await getPool();
        try {
            return pool.query(`
                INSERT INTO shelves (name, user_id) 
                VALUES (?, ?)
                `, [shelfName, userId]
            );
        } catch (e) {
            throw e;
        }
    }
    static async updateShelfName(oldName: string, newName: string, userId: number) {
        const pool: Pool = await getPool();
        try {
            return pool.query(`
                UPDATE shelves 
                SET name = ?
                WHERE name = ? AND user_id = ?
                `, [newName, oldName, userId]
            );
        } catch (e) {
            throw e;
        }
    }
    static async deleteShelf(shelfName: string, userId: number) {
        const pool: Pool = await getPool();
        try {
            return pool.query(`
                DELETE FROM shelves 
                WHERE name = ? AND user_id = ?
                `, [shelfName, userId]
            )
        } catch (e) {
            throw e;
        }
    }
    static async editShelvesOfBook(isbn: string, shelves: string[], userId: number) {
        const pool: Pool = await getPool();
        const connection: PoolConnection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [userHasBook] = await connection.query(`
                SELECT 1 FROM user_book
                WHERE user_id = ?
                AND isbn = ?
                `, [userId, isbn]
            );
            if (!userHasBook) return await connection.commit();

            await connection.query(`
                DELETE FROM shelves_books 
                WHERE book_isbn = ?
                AND shelf_id IN (SELECT id FROM shelves WHERE shelves.user_id = ?)
                `, [isbn, userId]
            );

            for (const shelf of shelves) {
                const [rows] = await connection.query(`
                    SELECT id FROM shelves
                    WHERE name = ? AND user_id = ?
                    `, [shelf, userId]
                );
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