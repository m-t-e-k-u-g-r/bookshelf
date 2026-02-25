import ISBN from 'isbn3';

export interface APIResponse {
    status: number;
    data?: any;
    error?: string;
}

export interface Book {
    isbn: string;
    title: string;
    author: string;
    publish_date: string;
    imgUrl: string | undefined;
}

interface GoogleBooksResponse {
    totalItems: number;
    items?: Array<{
        volumeInfo: {
            title: string;
            authors?: string[];
            publishedDate: string;
            industryIdentifiers: Array<{type: string, identifier: string}>;
            imageLinks?: {thumbnail: string};
        };
    }>
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

export async function getBook(isbn: string): Promise<APIResponse> {
    const api_url: string = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn.replace(/-/g, '')}`;
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
        const info = result.items![0].volumeInfo;
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