import {useEffect, useState} from 'react';
import Shelf from './Shelf';
import {BOOKS_API_URL, getShelves} from '../dataHandler';
import {Link} from "react-router-dom";
import type { BookProps } from "./Book";

export default function App() {
    const [books, setBooks] = useState<BookProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        const [booksRes] = await Promise.all([
            fetch(BOOKS_API_URL),
            getShelves()
        ]);
        const booksData: BookProps[] = await booksRes.json();
        setBooks(booksData);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            <Link to={'/'} id={'title'}>
                <h1>Bookshelf</h1>
            </Link>
            <div className={'container'}>
                <div className={'shelves'}>
                    {isLoading ? (
                        <p>Load books...</p>
                    ) : (
                        <Shelf
                            shelfId={"Books"}
                            books={books}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
