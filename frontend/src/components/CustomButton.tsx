import React from 'react';

type CustomButtonProps = {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    children: React.ReactNode;
};

export default function CustomButton({ onClick, children}: CustomButtonProps) {
    return (
        <button onClick={onClick} className={'button'}>
            {children}
        </button>
    )
}