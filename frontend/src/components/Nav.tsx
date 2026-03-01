import CustomButton from './CustomButton.js';
import { reload, addBook } from "../dataHandler";


export default function Nav() {

    return (
        <>
            <nav>
                <CustomButton onClick={reload} children={'Reload'}/>
                <CustomButton onClick={addBook} children={'Add Book'}/>
            </nav>
        </>
    );
}