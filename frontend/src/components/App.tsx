import {useEffect, useMemo, useState} from 'react';
import Shelf from './Shelf';
import {BOOKS_API_URL, getShelves} from '../dataHandler';
import {Link} from "react-router-dom";
import type { BookProps } from "./Book";

export default function App() {
    type SortKey = 'title' | 'author' | 'isbn' | 'publish_date';
    const [books, setBooks] = useState<BookProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortBy, setSortBy] = useState<SortKey>('title');

    const handleSortChange = (newValue: string) => {
        setSortBy(newValue);
    }

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

    const sortedBooks: BookProps[] = useMemo(() => {
        return [...books].sort((a, b) => {
            const valA: string = a[sortBy]?.toString().toLowerCase() || '';
            const valB: string = b[sortBy]?.toString().toLowerCase() || '';
            return valA.localeCompare(valB);
        });
    }, [books, sortBy]);

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
                            books={sortedBooks}
                            onSortChange={handleSortChange}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
