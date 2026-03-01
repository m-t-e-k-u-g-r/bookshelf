import {toast} from "react-toastify";

export const API_URL = 'http://localhost:5500';
export const BOOKS_API_URL = `${API_URL}/books/`;
export const SHELF_API_URL = `${API_URL}/shelves/`;

export interface menuItem {
    label: string;
    onClick: () => void;
}

export function cleanIsbn(isbn: string) {
    return isbn.replace(/-/g, '');
}

export async function getBooks(): Promise<Object[]> {
    try {
        const response: Response = await fetch(BOOKS_API_URL);
        return await response.json();
    } catch (e) {
        toast.error('Error while fetching books.');
        return [];
    }
}

export async function reload() {
    return toast.promise(
        fetch(BOOKS_API_URL + 'reset', { method: 'POST' })
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text());
                return res.text();
            }),
        {
            pending: 'Books reloading...',
            success: {
                render({data}) {
                    return `${data}`;
                }
            },
            error: 'Error while reloading books.'
        }
    );
}

export function addBook() {
    const enteredIsbn: string | null = window.prompt('Enter ISBN of book to add:');
    if (enteredIsbn === null) return;
    const isbn: string = cleanIsbn(enteredIsbn);

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

export async function getShelves(): Promise<Record<string, string[]>> {
    const data: Response = await fetch(SHELF_API_URL);
    return await data.json();
}

export async function editShelvesOfBook(isbn: string, shelves: string[]) {
    const promise = fetch(SHELF_API_URL, {
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
        pending: `Updating shelves for book '${isbn}'...`,
        success: `Shelves for book '${isbn}' updated.`,
        error: `Error while editing shelves of book '${isbn}'`
    });
}

export async function renameShelf(oldName: string, newName: string) {
    const promise = fetch(SHELF_API_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            shelf: oldName,
            shelfName: newName
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

export async function createShelf(shelfName: string) {
    const promise = fetch(SHELF_API_URL + shelfName, { method: 'POST' })
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

export async function deleteShelf(shelfName: string) {
    const promise = fetch(SHELF_API_URL + shelfName, { method: 'DELETE' })
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