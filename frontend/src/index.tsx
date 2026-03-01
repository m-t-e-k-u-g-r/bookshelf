import { StrictMode } from 'react';
import {createRoot, type Root} from 'react-dom/client';

import {BrowserRouter, Routes, Route} from "react-router-dom";

const rootElement: HTMLElement | null = document.getElementById('root');

if (!rootElement) {
    throw new Error("Root-Element with ID 'root' could not be found.");
}

const root: Root = createRoot(rootElement);
root.render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
            </Routes>
        </BrowserRouter>
    </StrictMode>
);