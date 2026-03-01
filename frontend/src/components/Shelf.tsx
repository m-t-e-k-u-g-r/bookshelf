import Book, {type BookProps} from './Book';

interface ShelfProps {
    shelfId: string;
    books: BookProps[];
}

export default function Shelf({ shelfId, books }: ShelfProps) {

    return (
        <>
            <h2>{shelfId}</h2>
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