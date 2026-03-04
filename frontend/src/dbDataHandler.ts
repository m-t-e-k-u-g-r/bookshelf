import {toast} from "react-toastify";
import type {BookProps} from "./components/Book";

export const API_URL: string = 'http://localhost:5500/';
export const DB_API_URL: string = API_URL + 'db/';
export const BOOKS_API_URL: string = DB_API_URL + 'books/';
export const SHELVES_API_URL: string = DB_API_URL + 'shelves/';

export async function getBooks(): Promise<BookProps[]> {
    try {
        const response: Response = await fetch(BOOKS_API_URL);
        return await response.json();
    } catch (e) {
        console.error('Error while fetching books:', e);
        toast.error('Error while fetching books');
        return [];
    }
}

export async function getShelves() {
    try {
        const response: Response = await fetch(SHELVES_API_URL);
        return await response.json();
    } catch (e) {
        console.error('Error while fetching shelves:', e);
    }
}

export async function getSidebarData() {
    try {
        const response: Response = await fetch(SHELVES_API_URL + 'sidebar');
        return await response.json();
    } catch (e) {
        console.error('Error while fetching sidebar data:', e);
    }
}