import {useState} from 'react';
import { Link } from 'react-router-dom';
import {createShelf, renameShelf, deleteShelf, type menuItem} from '../dbDataHandler';
import { useAppContext } from './App';
import {KebabMenu} from "./KebabMenu";
import {isOnlyWhitespace} from "../lib/utils";

export interface SidebarProps {
    name: string;
    count: number;
}

export default function Sidebar({ shelfData }: { shelfData: SidebarProps[] }) {
    const [isOpen, setIsOpen] = useState(true);
    const { reload } = useAppContext();

    function handleCreateShelf(): void {
        const shelfName: string | null = window.prompt('Enter name of new shelf:');
        if (shelfName === null || shelfName == '') return;
        if (isOnlyWhitespace(shelfName)) return;
        createShelf(shelfName);
        reload();
    }

    function handleRenameShelf(oldShelfName: string): void {
        const newShelfName: string | null = window.prompt('Enter new name of shelf:');
        if (newShelfName === null || newShelfName == '') return alert('No shelf name entered.');
        if (isOnlyWhitespace(newShelfName)) return alert('Shelf name cannot be only whitespace.');
        renameShelf(oldShelfName, newShelfName);
        reload();
    }

    function handleDeleteShelf(shelfName: string): void {
        const confirmed: boolean = window.confirm('Delete shelf?');
        if (!confirmed) return;
        deleteShelf(shelfName);
        reload();
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
                        {shelfData.map((shelf) => {
                            const sN: string = shelf.name;
                            const count: number = shelf.count;
                            const menuItems: menuItem[] = [
                                { label: 'Delete', onClick: () => handleDeleteShelf(sN) },
                                { label: 'Rename', onClick: () => handleRenameShelf(sN) }
                            ];
                            return (
                                <Link key={sN} title={sN} to={`/s/${sN}`} className={'shelf_entry'}>
                                    <span className={'shelf_wrapper'}>
                                        <p className={'shelf_name'}>{sN}</p>
                                        <p className={'count'}>{count}</p>
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