export interface BookProps {
    title: string;
    author: string;
    publish_date: string;
    isbn: string;
    imgUrl: string;
}

export default function Book({ title, author, publish_date, isbn, imgUrl }: BookProps) {

    return (
        <div className={'book'}>
            <img src={imgUrl} alt={`${title} by ${author}`}/>
            <div className={'book_content'}
                id={title.toLowerCase()
                    .replace(/ /g, '')}
            >
                <p title={title} className={'title'}>{title}</p>
                <div className={'meta'}>
                    <p className={'author'}>{author}</p>
                    <p className={'publishDate'}>Year: {publish_date}</p>
                    <p className={'isbn'}>{isbn}</p>
                </div>
            </div>
        </div>
    );
}