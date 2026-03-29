DROP DATABASE IF EXISTS `bookshelf`;
CREATE DATABASE `bookshelf`;
USE `bookshelf`;

CREATE TABLE `books` (
    isbn VARCHAR(13) NOT NULL,
    isbn_h VARCHAR(17) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    publish_year INT NOT NULL,
    img_url VARCHAR(255),
    PRIMARY KEY (isbn)
);

CREATE TABLE `shelves` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE `shelves_books` (
    shelf_id INT,
    book_isbn VARCHAR(13),
    PRIMARY KEY (shelf_id, book_isbn),
    FOREIGN KEY (shelf_id) REFERENCES shelves(id) ON DELETE CASCADE,
    FOREIGN KEY (book_isbn) REFERENCES books(isbn) ON DELETE CASCADE
);

CREATE TABLE `users` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    CONSTRAINT `email_unique` UNIQUE (email)
);

CREATE TABLE `user_book` (
    user_id INT NOT NULL,
    isbn VARCHAR(13) NOT NULL,
    read_status TINYINT(1) DEFAULT 0,
    PRIMARY KEY (isbn, user_id),
    FOREIGN KEY (isbn) REFERENCES books(isbn) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE `refresh_tokens` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_idfk INT NOT NULL,
    jti VARCHAR(255) NOT NULL UNIQUE,
    revoked TINYINT(1) DEFAULT 0,
    expires_at DATETIME NOT NULL,
    CONSTRAINT `refresh_token_fk` FOREIGN KEY (user_idfk) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE shelves
ADD COLUMN `user_id` INT NOT NULL,
ADD UNIQUE (user_id, name),
ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE VIEW `isbns_in_shelves` AS
    SELECT
        s.user_id,
        s.name AS shelf,
        b.isbn
    FROM shelves s
    JOIN shelves_books sb ON s.id = sb.shelf_id
    JOIN books b ON sb.book_isbn = b.isbn
    WHERE s.id = sb.shelf_id AND b.isbn = sb.book_isbn;

CREATE VIEW `books_in_shelves` AS
    SELECT
        s.user_id,
        s.name AS shelf,
        b.*
    FROM shelves s
    JOIN shelves_books sb ON s.id = sb.shelf_id
    JOIN books b ON b.isbn = sb.book_isbn;

CREATE VIEW `sidebar_data` AS
    SELECT
        s.user_id,
        s.id AS shelf_id,
        s.name,
        COUNT(sb.book_isbn) as count
    FROM shelves s
    LEFT JOIN shelves_books sb ON s.id = sb.shelf_id
    Group BY s.id, s.user_id, s.name;