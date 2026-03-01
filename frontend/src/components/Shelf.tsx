import Book, {type BookProps} from './Book';

interface ShelfProps {
    shelfId: string;
    books: BookProps[];
    onSortChange: (value: string) => void;
}

export default function Shelf({ shelfId, books, onSortChange }: ShelfProps) {

    return (
        <>
            <h2>{shelfId}</h2>
            <div className={'menu'}>
                <select id={'sort'} className={'select'} onChange={(e) => onSortChange(e.target.value)}>
                    <option value={'title'}>Title</option>
                    <option value={'author'}>Author</option>
                    <option value={'isbn'}>ISBN</option>
                </select>
            </div>
            <section className={'shelf'} id={shelfId}>
                {books.map((bookData: BookProps) =>
                    <Book
                        key={bookData.isbn}
                        title={bookData.title}
                        author={bookData.author}
                        publish_date={bookData.publish_date}
                        isbn={bookData.isbn}
                        imgUrl={bookData.imgUrl}
                    />
                )}
            </section>
        </>
    );
}