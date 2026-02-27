import ISBN from 'isbn3';
import type { Book } from "./dataManager.js";

export interface APIResponse {
    status: number;
    data?: any;
    error?: string;
}

interface GoogleBooksResponse {
    totalItems: number;
    items?: Array<{
        volumeInfo: volumeInfo;
    }>
}

interface volumeInfo {
    title: string;
    authors?: string[];
    publishedDate: string;
    industryIdentifiers: Array<{type: string, identifier: string}>;
    imageLinks?: {thumbnail: string};
}

export enum SortBy {
    TITLE = 'title',
    AUTHOR = 'author',
    ISBN = 'isbn',
    PUBLISH_DATE = 'publish_date'
}
export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}

export function sort(books: Book[], sortBy: SortBy, order: SortOrder): Book[] {
    return [...books].sort((a: any, b: any) => {
        const valA = String(a[sortBy] || '');
        const valB = String(b[sortBy] || '');
        if (order === SortOrder.ASC) {
            return valA.localeCompare(valB);
        } else {
            return valB.localeCompare(valA);
        }
    });
}

function isGoogleBooksResponse(value: unknown): value is GoogleBooksResponse {
    if (typeof value !== "object" || value === null) return false;
    if (!("totalItems" in value)) return false;

    const v = value as any;

    if (typeof v.totalItems !== "number") return false;

    if (v.totalItems > 0 && !Array.isArray(v.items)) return false;

    return true;
}

export function formatISBN(rawIsbn: string): string | undefined {
    const isbn = ISBN.parse(rawIsbn);
    if (isbn) {
        return isbn.isbn13h
    }
    return undefined;
}

export function cleanIsbn(isbn: string): string {
    return isbn.replace(/-/g, '');
}

export async function addBook(isbn: string, books: Book[]): Promise<APIResponse> {
    const entry: Book | undefined = books.find((e: any) => e.isbn == isbn);
    const response: APIResponse = await getBook(isbn);
    if (!entry) {
        return { status: 201, data: response.data };
    }
    return { status: 204 };
}

export async function getBook(isbn: string): Promise<APIResponse> {
    const apiKey: string | undefined = process.env.API_KEY;
    let api_url: string = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn(isbn)}`;

    if (apiKey) {
        api_url += `&key=${apiKey}`;
    }

    try {
        const response: Response = await fetch(api_url);
        if (!response.ok) {
            return { status: 502, error: 'Error during API-Request'}
        }
        const result: unknown = await response.json();

        if (!isGoogleBooksResponse(result)) {
            return { status: 502, error: 'Invalid response from API'}
        }

        if (result.totalItems === 0) {
            return { status: 404, error: 'Book not found'};
        }

        // @ts-ignore
        const info: volumeInfo = result.items![0].volumeInfo;
        const rawDate: string = info.publishedDate;
        const yearOnly: string = rawDate ? rawDate.substring(0, 4) : 'Unknown';
        const imgUrl: string = info.imageLinks?.thumbnail || 'https://placehold.co/400x640';
        const isbn13: string | undefined = formatISBN(info.industryIdentifiers.find((i: any) => i.type === 'ISBN_13')!.identifier);
        if (!isbn13) return { status: 422, error: 'ISBN could not be parsed'};

        return {
            status: 200,
            data: {
                isbn: isbn13,
                title: info.title,
                author: info.authors ? info.authors.join(', ') : 'Unknown',
                publish_date: yearOnly,
                imgUrl: imgUrl
            }
        };
    } catch (err) {
        return { status: 502, error: 'Error during API-Request'};
    }
}