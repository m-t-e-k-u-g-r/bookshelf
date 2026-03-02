INSERT INTO books (isbn, isbn_h, title, author, publish_year, img_url)
VALUES
    ('9780140449136', '978-0-14-044913-6', 'Crime and Punishment', 'Fyodor Dostoyevsky', '2003', 'http://books.google.com/books/content?id=SYu-4-oO3h8C&printsec=frontcover&img=1&zoom=1&source=gbs_api'),
    ('9783038580171', '978-3-03858-017-1', 'Die Leiden des jungen Werthers', 'Johann Wolfgang Goethe', '2022', 'https://placehold.co/400x640'),
    ('9780486821955', '978-0-486-82195-5', 'Don Quixote', 'Miguel de Cervantes', '2018', 'http://books.google.com/books/content?id=RwNKDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api'),
    ('9783988689573', '978-3-98868-957-3', 'Faust, der Tragödie erster Teil / Faust, Part One', 'Johann Wolfgang von Goethe', '2024', 'http://books.google.com/books/content?id=Yon2EAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api'),
    ('9780140444308', '978-0-14-044430-8', 'Les Miserables', 'Victor Hugo', '1982', 'http://books.google.com/books/content?id=wmOaqufINEUC&printsec=frontcover&img=1&zoom=1&source=gbs_api'),
    ('9780140449129', '978-0-14-044912-9', 'Madame Bovary', 'Gustave Flaubert', '2003', 'http://books.google.com/books/content?id=2XIoODQ-JSsC&printsec=frontcover&img=1&zoom=1&source=gbs_api'),
    ('9780060883287', '978-0-06-088328-7', 'One Hundred Years of Solitude', 'Gabriel Garcia Marquez', '2006', 'http://books.google.com/books/content?id=Rtk8PgAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api'),
    ('9780140449174', '978-0-14-044917-4', 'Penguin Classics Anna Karenina', 'Leo Tolstoy', '2002', 'http://books.google.com/books/content?id=14OMEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api'),
    ('9781806982561', '978-1-80698-256-1', 'The Brothers Karamazov', 'Fyodor M Dostoevsky', '2025', 'http://books.google.com/books/content?id=x9_F0QEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api'),
    ('9781781393192', '978-1-78139-319-2', 'The Divine Comedy / La Divina Commedia - Parallel Italian / English Translation', 'Dante Alighieri, Henry Wadsworth Longfellow', '2012', 'http://books.google.com/books/content?id=XinZNAEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api'),
    ('9780140275360', '978-0-14-027536-0', 'The Iliad', 'Homer', '1998', 'http://books.google.com/books/content?id=8IVPEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api'),
    ('9780141439570', '978-0-14-143957-0', 'The Picture of Dorian Gray', 'Oscar Wilde', '2003', 'http://books.google.com/books/content?id=L10wEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api'),
    ('9780140447934', '978-0-14-044793-4', 'War and Peace', 'Leo Tolstoy', '2009', 'http://books.google.com/books/content?id=9XOMEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api'),
    ('9781806982516', '978-1-80698-251-6', 'Anna Karenina', 'Count Leo Nikolayevich Tolstoy, 1828-1910 Gra', '2025', 'http://books.google.com/books/content?id=SxfH0QEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api');

INSERT INTO shelves (name)
VALUES
    ('Classics'),
    ('Philosophy'),
    ('Favorites');

INSERT INTO shelves_books (shelf_id, book_isbn)
VALUES
    (1, '9780140444308'),
    (1, '9780486821955'),
    (1, '9780140449136'),
    (2, '9783038580171'),
    (3, '9783038580171'),
    (3, '9780060883287'),
    (3, '9780140449136')