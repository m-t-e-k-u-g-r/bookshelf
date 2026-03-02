import CustomButton from './CustomButton.js';
import { reload, addBook } from "../dataHandler";
import CombinedInput from "./CombinedInput";
import {useRef} from "react";


export default function Nav() {
    const dialogRef = useRef<HTMLDialogElement>(null);
    function openDialog() {
        dialogRef.current?.showModal();
    }
    function closeDialog() {
        dialogRef.current?.close();
    }

    return (
        <>
            <nav>
                <CustomButton onClick={reload} children={'Reload'}/>
                <CustomButton onClick={openDialog} children={'Add Batch'}/>
                <CustomButton onClick={addBook} children={'Add Book'}/>
            </nav>
            <dialog ref={dialogRef}>
                <CombinedInput close={closeDialog}/>
            </dialog>
        </>
    );
}