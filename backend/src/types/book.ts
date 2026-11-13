export interface Book {
    isbn: string;
    isbn_h: string;
    title: string;
    author: string;
    publish_date: string;
    imgUrl: string;
    read_status: number | boolean;
}

export interface BookInShelf extends Book {
    shelf: string;
}