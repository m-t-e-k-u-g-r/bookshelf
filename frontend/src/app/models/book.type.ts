export interface Book {
  isbn: string;
  isbn_h: string;
  title: string;
  author: string;
  publish_year: number;
  img_url: string;
  read_status: boolean;
}

export interface BookWithShelf extends Book {
  shelf: string;
}
