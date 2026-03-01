import {useEffect, useMemo, useState} from 'react';
import Shelf from './Shelf';
import {BOOKS_API_URL, cleanIsbn, getShelves} from '../dataHandler';
import {Link, useParams} from "react-router-dom";
import type { BookProps } from "./Book";
import Sidebar from "./Sidebar";
import Nav from "./Nav";
import type {ToastMessage} from "./ToastContainer";
import { ToastContext } from "../context/ToastContext";
import {ToastContainer} from "react-bootstrap";

export default function App() {
    type SortKey = 'title' | 'author' | 'isbn' | 'publish_date';
    const [books, setBooks] = useState<BookProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortBy, setSortBy] = useState<SortKey>('title');
    const [shelves, setShelves] = useState<Record<string, string[]>>({});
    const { shelfId } = useParams<{ shelfId: string }>();
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = (message: string) => {
        const id: number = Date.now();
        setToasts(prev => [...prev, {id, message}]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 3000);
    };

    const handleSortChange = (newValue: string) => {
        setSortBy(newValue);
    }

    const fetchData = async () => {
        const [booksRes, shelvesRes] = await Promise.all([
            fetch(BOOKS_API_URL),
            getShelves()
        ]);
        const booksData: BookProps[] = await booksRes.json();
        setBooks(booksData);
        setShelves(shelvesRes);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredBooks: BookProps[] = useMemo(() => {
        if (!shelfId || !shelves[shelfId]) return books;

        const selectedIsbns: string[] = shelves[shelfId];

        return books.filter((b) => {
            const cleanISBN: string = cleanIsbn(b.isbn);
            return selectedIsbns.some((isbn: string) => cleanIsbn(isbn) === cleanISBN);
        })
    }, [books, shelves, shelfId])

    const sortedBooks: BookProps[] = useMemo(() => {
        return [...filteredBooks].sort((a, b) => {
            const valA: string = a[sortBy]?.toString().toLowerCase() || '';
            const valB: string = b[sortBy]?.toString().toLowerCase() || '';
            return valA.localeCompare(valB);
        });
    }, [filteredBooks, sortBy]);

    return (
        <ToastContext.Provider value={{ toasts, addToast}}>
            <Nav/>
            <ToastContainer/>
            <Link to={'/'} id={'title'}>
                <h1>Bookshelf</h1>
            </Link>
            <div className={'container'}>
                <div className={'sideBar'}>
                    <Sidebar
                        shelfData={shelves}
                    />
                </div>
                <div className={'shelves'}>
                    {isLoading ? (
                        <p>Load books...</p>
                    ) : (
                        <Shelf
                            shelfId={shelfId || "Books"}
                            books={sortedBooks}
                            onSortChange={handleSortChange}
                        />
                    )}
                </div>
            </div>
        </ToastContext.Provider>
    );
}
