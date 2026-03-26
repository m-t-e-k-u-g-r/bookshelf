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
    return await createPool();
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

export interface ShelfOfBook {
    shelf: string;
}

export type ISBNList = string[]

type isbnObject = {
    isbn: string;
}

export interface SidebarData {
    name: string;
    count: number;
}

export class DbDataManager {
    static async signupUser(email: string, password_hash: string) {
        try {
            const pool: Pool = await getPool();
            return await pool.query(`
                INSERT INTO users (email, password_hash)
                VALUES (?, ?)
                `, [email, password_hash]
            );
        } catch (e) {
            throw e;
        }
    }
    static async deleteUser(userId: number) {
        try {
            const pool: Pool = await getPool();
            return await pool.query(`
                DELETE FROM users
                WHERE id = ?
                `, [userId]
            );
        } catch (e) {
            throw e;
        }
    }
    static async addRefreshToken(userId: number, jti: string) {
        try {
            const pool: Pool = await getPool();
            return await pool.query(`
                INSERT INTO refresh_tokens (user_idfk, jti, expires_at)
                VALUES (?, ?, NOW() + INTERVAL 1 DAY)
                `, [userId, jti]
            );
        } catch (e) {
            throw e;
        }
    }
    static async getRefreshTokenByJti(jti: string) {
        try {
            const pool: Pool = await getPool();
            const result = await pool.query(`
                SELECT * FROM refresh_tokens
                WHERE jti = ? AND revoked = 0
                `, [jti]
            );
            if (result.length === 0) {
                return null;
            }
            return result[0];
        } catch (e) {
            throw e;
        }
    }
    static async revokeRefreshToken(jti: string) {
        try {
            const pool: Pool = await getPool();
            return await pool.query(`
                UPDATE refresh_tokens
                SET revoked = 1
                WHERE jti = ?
                `, [jti]
            );
        } catch (e) {
            throw e;
        }
    }
    static async getUser(email: string) {
        try {
            const pool: Pool = await getPool();
            const result = await pool.query(`
                SELECT * FROM users
                WHERE email = ?
                `, [email]
            );
            if (result.length === 0) {
                return null;
            }
            return result[0];
        } catch (e) {
            throw e;
        }
    }
    static async getBooks(userId: number): Promise<Book[]> {
        try {
            const pool: Pool = await getPool();
            const isbnList: isbnObject[] = await pool.query(`
                SELECT isbn FROM user_book
                WHERE user_id = ?
                `, [userId]
            );
            const isbnArray = isbnList.map(r => r.isbn);
            if (isbnArray.length === 0) return [];
            const placeholders = isbnArray.map(() => '?').join(',');
            return await pool.query(`
                SELECT * FROM books
                WHERE isbn IN (${placeholders})
                `, isbnArray
            );
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

            await connection.query(`
                DELETE FROM shelves_books 
                WHERE book_isbn = ?
                `, [isbn]
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