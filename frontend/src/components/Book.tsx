import {handleBookDelete, type menuItem} from "../dataHandler";
import {useState} from "react";
import { KebabMenu } from "./KebabMenu";

export interface BookProps {
    title: string;
    author: string;
    publish_date: string;
    isbn: string;
    imgUrl: string;
}

export default function Book({ title, author, publish_date, isbn, imgUrl }: BookProps) {
    const [isDeleted, setIsDeleted] = useState(false);

    const menuItems: menuItem[] = [
        {label: 'Delete', onClick: () => {
            handleBookDelete(title, isbn)
                setIsDeleted(true);
        }}
    ];

    return (
        <div className={isDeleted ? 'book deleted': 'book'}>
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
                <KebabMenu
                    items={menuItems}
                />
            </div>
        </div>
    );
}