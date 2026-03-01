import React, { useState, useRef, useEffect } from 'react';

type MenuItem = {
    label: string;
    onClick: () => void;
};

interface KebabMenuProps {
    items: MenuItem[];
}

export const KebabMenu: React.FC<KebabMenuProps> = ({ items }: KebabMenuProps) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
            <button onClick={(e) => {
                setOpen(!open)
                e.preventDefault();
            }} className="kebab-button">
                &#8942;
            </button>
            {open && (
                <ul className="kebab-menu">
                    {items.map((item, idx) => (
                        <li key={idx} onClick={() => { item.onClick(); setOpen(false); }}>
                            {item.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};