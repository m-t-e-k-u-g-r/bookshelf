import {useState} from 'react';
import { Link } from 'react-router-dom';
import {createShelf, deleteShelf, type menuItem, renameShelf} from '../dataHandler';
import {KebabMenu} from "./KebabMenu";

export default function Sidebar({ shelfData }: { shelfData: Record<string, string[]> }) {
    const [isOpen, setIsOpen] = useState(true);
    const shelfNames: string[] = Object.keys(shelfData);

    function handleCreateShelf(): void {
        const shelfName: string | null = window.prompt('Enter name of new shelf:');
        if (shelfName === null) return;
        createShelf(shelfName);
    }

    function handleRenameShelf(oldShelfName: string): void {
        const newShelfName: string | null = window.prompt('Enter new name of shelf:');
        if (newShelfName === null) return alert('No shelf name entered.');
        renameShelf(oldShelfName, newShelfName);
    }

    function handleDeleteShelf(shelfName: string): void {
        const confirmed: boolean = window.confirm('Delete shelf?');
        if (!confirmed) return;
        deleteShelf(shelfName);
    }

    return (
        <div className={'custom_accordion'}>
            <div className={'accordion_item'}>
                <button 
                    className={`accordion_header ${isOpen ? '' : 'collapsed'}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    Shelves
                </button>
                {isOpen && (
                    <div className={'accordion_body'}>
                        {shelfNames.map((sN: string) => {
                            const menuItems: menuItem[] = [
                                { label: 'Delete', onClick: () => handleDeleteShelf(sN) },
                                { label: 'Rename', onClick: () => handleRenameShelf(sN) }
                            ];
                            return (
                                <Link key={sN} title={sN} to={`/s/${sN}`} className={'shelf_entry'}>
                                    <span className={'shelf_wrapper'}>
                                        <p className={'shelf_name'}>{sN}</p>
                                        <p className={'count'}>{shelfData[sN] !== undefined ? shelfData[sN].length : 0}</p>
                                        <div className={'shelf-menu'}>
                                            <KebabMenu items={menuItems} />
                                        </div>
                                    </span>
                                </Link>
                            );
                        })}
                        <button
                            onClick={handleCreateShelf}
                            className={'create_shelf_button'}
                        >
                            Create Shelf
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}