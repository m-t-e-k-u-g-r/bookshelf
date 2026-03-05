import {
    type menuItem,
    handleBookDelete,
    editShelvesOfBook,
    getShelvesOfBook,
    getAllShelves
} from '../dbDataHandler';
import {useRef, useState} from "react";
import { KebabMenu } from "./KebabMenu";
import { useAppContext} from "./App";
import {toast} from "react-toastify";

export interface BookProps {
    title: string;
    author: string;
    publish_year: string;
    isbn: string;
    isbn_h: string;
    img_url: string;
}

export interface BooksWithShelves extends BookProps {
    shelf: string;
}

export default function Book({ title, author, publish_year, isbn, isbn_h, img_url }: BookProps) {
    const { reload } = useAppContext();
    const [isDeleted, setIsDeleted] = useState(false);
    const [allShelves, setAllShelves] = useState<string[]>([]);
    const [shelves, setShelves] = useState<string[]>([]);
    const dialogRef = useRef<HTMLDialogElement>(null);

    const menuItems: menuItem[] = [
        {label: 'Delete', onClick: () => {
            handleBookDelete(title, isbn)
                setIsDeleted(true);
        }},
        {label: 'Edit shelves', onClick: () => editShelves()},
    ];

    async function editShelves(): Promise<void> {
        const AllShelves: string[] = await getAllShelves();
        const shelves: string[] = await getShelvesOfBook(isbn);
        setAllShelves(AllShelves);
        setShelves(shelves);
        dialogRef.current?.showModal();
    }

    function handleShelfChange(shelfName: string, isChecked: boolean): void {
        if (isChecked) {
            setShelves(prev => prev.includes(shelfName) ? prev : [...prev, shelfName]);
        } else {
            setShelves(prev => prev.filter(s => s !== shelfName));
        }
    }

    async function handleSave(): Promise<void> {
        try {
            await editShelvesOfBook(isbn, shelves);
            dialogRef.current?.close();
            reload();
        } catch (e) {
            toast.error('Error saving shelves');
            console.error('Error saving shelves:', e);
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
                        {(allShelves).map((shelfName: string) => (
                            <div key={shelfName} style={{ marginBottom: '10px' }}>
                                <label>
                                    <input
                                        type={'checkbox'}
                                        checked={shelves.includes(shelfName)}
                                        onChange={(e) => handleShelfChange(shelfName, e.target.checked)}
                                    />
                                    {shelfName}
                                </label>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleSave}>
                        Close
                    </button>
                </div>
            </dialog>
        </div>
    );
}