export const API_URL = 'http://localhost:5500';
export const BOOKS_API_URL = `${API_URL}/books/`;
export const SHELF_API_URL = `${API_URL}/shelves/`;

export function cleanIsbn(isbn: string) {
    return isbn.replace(/-/g, '');
}

export interface menuItem {
    label: string;
    onClick: () => void;
}

export async function getBooks(): Promise<Object[]> {
    try {
        const response: Response = await fetch(BOOKS_API_URL);
        return await response.json();
    } catch (e) {
        return [];
    }
}

export async function reload() {
    try {
        const response: Response = await fetch(BOOKS_API_URL + 'reset', {
            method: 'POST'
        });
        const result: string = await response.text();
        console.log(result);
    } catch (e) {
        console.error(e);
    }
}

export function addBook() {
    const enteredIsbn: string | null = window.prompt('Enter ISBN of book to add:');
    if (enteredIsbn === null) return;
    const isbn: string = cleanIsbn(enteredIsbn);
    fetch(BOOKS_API_URL + isbn, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
        .catch(error => {
            console.error(error);
        });
}

export function handleBookDelete(title: string, isbn: string) {
    const confirmed: boolean = window.confirm(`Delete book "${title}"?`);
    if (!confirmed) return;
    fetch(BOOKS_API_URL + isbn, { method: 'DELETE' })
        .catch(error => {
            console.error(error);
        });
}

export async function getShelves(): Promise<Record<string, string[]>> {
    const data: Response = await fetch(SHELF_API_URL);
    return await data.json();
}

export async function editShelvesOfBook(isbn: string, shelves: string[]) {
    const res: Response = await fetch(SHELF_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            isbn: isbn,
            shelves: shelves
        })
    });
    if (res.status !== 201) {
        console.error(await res.text());
    }
}

export async function renameShelf(oldName: string, newName: string) {
    const res: Response = await fetch(SHELF_API_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            shelf: oldName,
            shelfName: newName
        })
    });
    if (res.status !== 200) {
        console.error(await res.text());
    }
}

export async function createShelf(shelfName: string) {
    const res: Response = await fetch(SHELF_API_URL + shelfName, { method: 'POST' });
    if (res.status !== 201) {
        console.error(await res.text());
        return alert(`Error while creating shelf '${shelfName}': ${await res.text()}`)
    }
}

export async function deleteShelf(shelfName: string) {
    const res: Response = await fetch(SHELF_API_URL + shelfName, { method: 'DELETE' });
    if (res.status !== 204) {
        console.error(await res.text());
        return alert(`Error while deleting shelf '${shelfName}'`)
    }
}