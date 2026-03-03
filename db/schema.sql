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
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE `shelves_books` (
    shelf_id INT,
    book_isbn VARCHAR(13),
    PRIMARY KEY (shelf_id, book_isbn),
    FOREIGN KEY (shelf_id) REFERENCES shelves(id) ON DELETE CASCADE,
    FOREIGN KEY (book_isbn) REFERENCES books(isbn) ON DELETE CASCADE
);

CREATE VIEW `isbns_in_shelves` AS
    SELECT s.name, b.isbn FROM shelves s, shelves_books sb, books b
    WHERE s.id = sb.shelf_id AND b.isbn = sb.book_isbn;

CREATE VIEW `books_in_shelves` AS
    SELECT iis.name AS shelf, b.*
    FROM isbns_in_shelves iis, books b
    WHERE b.isbn = iis.isbn;

CREATE VIEW `sidebar_data` AS
    SELECT s.name, COUNT(sb.book_isbn) as count
    FROM shelves s
    LEFT JOIN shelves_books sb ON s.id = sb.shelf_id
    GROUP BY s.id;