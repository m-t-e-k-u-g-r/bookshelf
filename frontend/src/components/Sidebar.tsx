import {useState} from 'react';
import { Link } from 'react-router-dom';
import {createShelf} from '../dataHandler';

export default function Sidebar({ shelfData }: { shelfData: Record<string, string[]> }) {
    const [isOpen, setIsOpen] = useState(true);
    const shelfNames: string[] = Object.keys(shelfData);

    function handleCreateShelf(): void {
        const shelfName: string | null = window.prompt('Enter name of new shelf:');
        if (shelfName === null) return;
        createShelf(shelfName);
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
                        {shelfNames.map((sN: string) => (
                            <Link key={sN} title={sN} to={`/s/${sN}`} className={'shelf_entry'}>
                                <span className={'shelf_wrapper'}>
                                    <p className={'shelf_name'}>{sN}</p>
                                    <p className={'count'}>{shelfData[sN] !== undefined ? shelfData[sN].length : 0}</p>
                                </span>
                            </Link>
                        ))}
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