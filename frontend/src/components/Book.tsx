import {handleBookDelete, type menuItem, getShelves, editShelvesOfBook, cleanIsbn} from "../dataHandler";
import {useRef, useState} from "react";
import { KebabMenu } from "./KebabMenu";
import { useAppContext} from "./App";

export interface BookProps {
    title: string;
    author: string;
    publish_year: string;
    isbn: string;
    isbn_h: string;
    img_url: string;
}

export default function Book({ title, author, publish_year, isbn, isbn_h, img_url }: BookProps) {
    const { reload } = useAppContext();
    const [isDeleted, setIsDeleted] = useState(false);
    const [allShelves, setAllShelves] = useState<Record<string, string[]>>({});
    const dialogRef = useRef<HTMLDialogElement>(null);

    const menuItems: menuItem[] = [
        {label: 'Delete', onClick: () => {
            handleBookDelete(title, isbn)
                setIsDeleted(true);
        }},
        {label: 'Edit shelves', onClick: () => editShelves()},
    ];

    async function editShelves() {
        const shelfData: Record<string, string[]> = await getShelves();
        setAllShelves(shelfData);
        dialogRef.current?.showModal();
    }

    async function handleShelfChange(shelfName: string, isChecked: boolean) {
        const cleanCurrentIsbn: string = cleanIsbn(isbn);
        const updatedShelves = { ...allShelves };

        if (isChecked) {
            const currentShelves: string[] = updatedShelves[shelfName] || [];
            if (!currentShelves.map(cleanIsbn).includes(cleanCurrentIsbn)) {
                updatedShelves[shelfName] = [...(updatedShelves[shelfName] || []), isbn];
            }
        } else {
            updatedShelves[shelfName] = (updatedShelves[shelfName] ?? []).filter(i => cleanIsbn(i) !== cleanCurrentIsbn);
        }

        const selectedShelves: string[] = Object.keys(updatedShelves).filter(name =>
            (updatedShelves[name] ?? []).includes(isbn)
        );

        const ISBN: string = cleanIsbn(isbn);

        try {
            editShelvesOfBook(ISBN, selectedShelves);
            setAllShelves(updatedShelves);
            reload();
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className={isDeleted ? 'book deleted': 'book'}>
            <img src={img_url} alt={`${title} by ${author}`}/>
            <div className={'book_content'}
                id={title.toLowerCase()
                    .replace(/ /g, '')}
            >
                <p title={title} className={'title'}>{title}</p>
                <div className={'meta'}>
                    <p className={'author'}>{author}</p>
                    <p className={'publishDate'}>Year: {publish_year}</p>
                    <p className={'isbn'}>{isbn_h}</p>
                </div>
                <KebabMenu
                    items={menuItems}
                />
            </div>
            <dialog ref={dialogRef}>
                <div>
                    <h3>Edit shelves for "{title}"</h3>
                    <div style={{ margin: '15px 0' }}>
                        {Object.keys(allShelves).map(shelfName => (
                            <div key={shelfName} style={{ marginBottom: '10px' }}>
                                <label>
                                    <input
                                        type={'checkbox'}
                                        checked={allShelves[shelfName]?.map(cleanIsbn).includes(cleanIsbn(isbn))}
                                        onChange={(e) => handleShelfChange(shelfName, e.target.checked)}
                                    />
                                    {shelfName}
                                </label>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => {
                            dialogRef.current?.close()
                        }}
                        className="button"
                    >
                        Close
                    </button>
                </div>
            </dialog>
        </div>
    );
}