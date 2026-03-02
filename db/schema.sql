CREATE DATABASE IF NOT EXISTS `bookshelf`;
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
    name VARCHAR(255)
);

CREATE TABLE `shelves_books` (
    shelf_id INT,
    book_isbn VARCHAR(13),
    PRIMARY KEY (shelf_id, book_isbn),
    FOREIGN KEY (shelf_id) REFERENCES shelves(id),
    FOREIGN KEY (book_isbn) REFERENCES books(isbn)
);