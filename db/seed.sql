-- Seed data

-- Example user with password '1234'
INSERT INTO users (id, email, password_hash)
VALUES
    (2, 'test@email.com', '$2b$12$kIAbmWHd9qcdQxMHd9v3leGoA29G8hWGvehKvHdeLVYjKmsAtGlaG');

INSERT INTO books (isbn, isbn_h, title, author, publish_year, img_url)
VALUES
    ('9780140449136', '978-0-14-044913-6', 'Crime and Punishment', 'Fyodor Dostoyevsky', '2003', 'http://books.google.com/books/content?id=SYu-4-oO3h8C&printsec=frontcover&img=1&zoom=1&source=gbs_api'),
    ('9780486821955', '978-0-486-82195-5', 'Don Quixote', 'Miguel de Cervantes', '2018', 'http://books.google.com/books/content?id=RwNKDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api'),
    ('9783988689573', '978-3-98868-957-3', 'Faust, der Tragödie erster Teil / Faust, Part One', 'Johann Wolfgang von Goethe', '2024', 'http://books.google.com/books/content?id=Yon2EAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api'),
    ('9780140444308', '978-0-14-044430-8', 'Les Miserables', 'Victor Hugo', '1982', 'http://books.google.com/books/content?id=wmOaqufINEUC&printsec=frontcover&img=1&zoom=1&source=gbs_api'),
    ('9780140449129', '978-0-14-044912-9', 'Madame Bovary', 'Gustave Flaubert', '2003', 'http://books.google.com/books/content?id=2XIoODQ-JSsC&printsec=frontcover&img=1&zoom=1&source=gbs_api'),
    ('9780060883287', '978-0-06-088328-7', 'One Hundred Years of Solitude', 'Gabriel Garcia Marquez', '2006', 'http://books.google.com/books/content?id=Rtk8PgAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api'),
    ('9780140449174', '978-0-14-044917-4', 'Penguin Classics Anna Karenina', 'Leo Tolstoy', '2002', 'http://books.google.com/books/content?id=14OMEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api'),
    ('9781781393192', '978-1-78139-319-2', 'The Divine Comedy / La Divina Commedia - Parallel Italian / English Translation', 'Dante Alighieri, Henry Wadsworth Longfellow', '2012', 'http://books.google.com/books/content?id=XinZNAEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api'),
    ('9780140275360', '978-0-14-027536-0', 'The Iliad', 'Homer', '1998', 'http://books.google.com/books/content?id=8IVPEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api'),
    ('9780141439570', '978-0-14-143957-0', 'The Picture of Dorian Gray', 'Oscar Wilde', '2003', 'http://books.google.com/books/content?id=L10wEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api');

INSERT INTO user_book (user_id, isbn)
VALUES
    (2, '9780140449136'),
    (2, '9780486821955'),
    (2, '9783988689573'),
    (2, '9780140444308'),
    (2, '9780140449129'),
    (2, '9780060883287'),
    (2, '9780140449174'),
    (2, '9781781393192'),
    (2, '9780140275360'),
    (2, '9780141439570');

INSERT INTO shelves (id, name, user_id)
VALUES
    (1, 'Classics', 2),
    (2, 'Philosophy', 2),
    (3, 'Favorites', 2);

INSERT INTO shelves_books (shelf_id, book_isbn)
VALUES
    (1, '9780140444308'),
    (1, '9780486821955'),
    (1, '9780140449136'),
    (2, '9780140449129'),
    (3, '9780060883287'),
    (3, '9780140449136')