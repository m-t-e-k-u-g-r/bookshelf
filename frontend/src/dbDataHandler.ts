import {toast} from "react-toastify";
import type {BookProps} from "./components/Book";
import {isOnlyWhitespace} from "./lib/utils";

export const API_URL: string = 'http://localhost:5500/';
export const DB_API_URL: string = API_URL + 'db/';
export const BOOKS_API_URL: string = DB_API_URL + 'books/';
export const SHELVES_API_URL: string = DB_API_URL + 'shelves/';

export interface menuItem {
    label: string;
    onClick: () => void;
}

export function cleanText(text: string) {
    return text.replace(/-/g, '');
}

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

export async function getShelvedBooks() {
    try {
        const response: Response = await fetch(SHELVES_API_URL);
        return await response.json();
    } catch (e) {
        console.error('Error while fetching shelves:', e);
    }
}

export async function getAllShelves() {
    try {
        const response: Response = await fetch(SHELVES_API_URL + 'names');
        return await response.json();
    } catch (e) {
        console.error('Error while fetching shelves:', e);
    }
}

export async function getShelvesOfBook(isbn: string) {
    try {
        const response: Response = await fetch(SHELVES_API_URL + 'b/' + isbn);
        return await response.json();
    } catch (e: any) {
        if (e.status === 404) return [];
        console.error('Error while fetching shelves of book:', e);
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

export function addBook() {
    const enteredIsbn: string | null = window.prompt('Enter ISBN of book to add:');
    if (enteredIsbn === null || isOnlyWhitespace(enteredIsbn)) return alert('ISBN cannot be empty');
    const isbn: string = cleanText(enteredIsbn);

    const promise = fetch(BOOKS_API_URL + isbn, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error while adding book');
        return data;
    });

    toast.promise(promise, {
        pending: 'Adding book...',
        success: {
            render({data}) {
                return data.message;
            }
        },
        error: {
            render({data}) {
                return (data as Error).message;
            }
        }
    });
}

export async function addBatch(batch: string[]) {
    if (batch.length === 0) return;

    const promise: Promise<any> = fetch(BOOKS_API_URL + 'batch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            isbns: batch
        })
    }).then(async (response) => {
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error while adding books');
            return data;
    })

    toast.promise(promise, {
        pending: 'Adding books...',
        success: {
            render({data}) {
                return data.message;
            }
        },
        error: {
            render({data}) {
                return (data as Error).message;
            }
        }
    });
}

export function handleBookDelete(title: string, isbn: string) {
    const confirmed: boolean = window.confirm(`Delete book "${title}"?`);
    if (!confirmed) return;

    const promise = fetch(BOOKS_API_URL + isbn, { method: 'DELETE' })
        .then(async (res) => {
            if (!res.ok) throw new Error(await res.text());
            return res;
        });

    toast.promise(promise, {
        pending: `Deleting book '${title}'...`,
        success: `Book '${title}' deleted.`,
        error: `Error while deleting book '${title}'`
    });
}

export async function createShelf(shelfName: string) {
    const promise = fetch(SHELVES_API_URL + shelfName, { method: 'POST' })
        .then(async (res) => {
            if (res.status !== 201) {
                throw new Error(await res.text());
            }
            return res;
        });

    toast.promise(promise, {
        pending: `Creating shelf '${shelfName}'...`,
        success: `Shelf '${shelfName}' created.`,
        error: {
            render({data}) {
                return `Error while creating shelf '${shelfName}': ${(data as Error).message}`;
            }
        }
    });
}

export async function renameShelf(oldName: string, newName: string) {
    const promise = fetch(SHELVES_API_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            oldShelfName: oldName,
            newShelfName: newName
        })
    }).then(async (res) => {
        if (res.status !== 200) {
            throw new Error(await res.text());
        }
        return res;
    });

    toast.promise(promise, {
        pending: `Renaming shelf '${oldName}' to '${newName}'...`,
        success: `Shelf '${oldName}' renamed to '${newName}'.`,
        error: `Error while renaming shelf '${oldName}' to '${newName}'`
    });
}

export async function deleteShelf(shelfName: string) {
    const promise = fetch(SHELVES_API_URL + shelfName, { method: 'DELETE' })
        .then(async (res) => {
            if (res.status !== 204) {
                throw new Error(await res.text());
            }
            return res;
        });

    toast.promise(promise, {
        pending: `Deleting shelf '${shelfName}'...`,
        success: `Shelf '${shelfName}' deleted.`,
        error: `Error while deleting shelf '${shelfName}'`
    });
}

export async function editShelvesOfBook(isbn: string, shelves: string[]) {
    const promise = fetch(SHELVES_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            isbn: isbn,
            shelves: shelves
        })
    }).then(async (res) => {
        if (res.status !== 201) {
            throw new Error(await res.text());
        }
        return res;
    });

    toast.promise(promise, {
        error: `Error while editing shelves of book '${isbn}'`
    });
}