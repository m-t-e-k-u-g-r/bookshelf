import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import Shelf from './Shelf';
import {getBooks, getShelvedBooks, getSidebarData} from '../dbDataHandler';
import {Link, useParams} from "react-router-dom";
import type {BookProps, BooksWithShelves} from "./Book";
import Sidebar, {type SidebarProps} from "./Sidebar";
import Nav from "./Nav";
import { ToastContainer } from "react-toastify";

export const AppContext = createContext<{ reload: () => void } | undefined>(undefined);
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}

export type SortKey = 'title' | 'author' | 'isbn';
export default function App() {
    const [books, setBooks] = useState<BookProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortBy, setSortBy] = useState<SortKey>('title');
    const [shelvedBooks, setShelvedBooks] = useState<BooksWithShelves[]>([]);
    const [sidebarData, setSidebarData] = useState<SidebarProps[]>([]);
    const { shelfId } = useParams<{ shelfId: string }>();

    const handleSortChange = (newValue: SortKey) => {
        setSortBy(newValue);
    }

    const fetchData = async () => {
        const [booksRes, shelvesRes, sidebarRes]: [BookProps[], BooksWithShelves[], SidebarProps[]] = await Promise.all([
            getBooks(),
            getShelvedBooks(),
            getSidebarData()
        ]);
        setBooks(booksRes);
        setShelvedBooks(shelvesRes);
        setSidebarData(sidebarRes);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    function reload() {
        fetchData();
    }

    const filteredBooks: BookProps[] = useMemo(() => {
        if (!shelfId) return books;

        return shelvedBooks.filter(s => s.shelf === shelfId)
    }, [books, shelvedBooks, shelfId])

    const sortedBooks: BookProps[] = useMemo(() => {
        return [...filteredBooks].sort((a, b) => {
            const valA: string = a[sortBy]?.toString().toLowerCase() || '';
            const valB: string = b[sortBy]?.toString().toLowerCase() || '';
            return valA.localeCompare(valB);
        });
    }, [filteredBooks, sortBy]);

    return (
        <AppContext.Provider value={{ reload }}>
            <Nav/>
            <ToastContainer toastClassName="toast"/>
            <Link to={'/'} id={'title'}>
                <h1>Bookshelf</h1>
            </Link>
            <div className={'container'}>
                <div className={'sideBar'}>
                    <Sidebar
                        shelfData={sidebarData}
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
        </AppContext.Provider>
    );
}
