import CustomButton from "./CustomButton";
import {addBatch} from "../dbDataHandler";
import {type ChangeEvent, useState} from "react";

export default function CombinedInput({ close }: { close: () => void }) {
    const [content, setContent] = useState<string[]>([]);

    async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            const file: File | undefined = e.target.files[0];
            if (!file) return;

            const content: string = await file.text();
            const values: string[] = content
                .split(/[\r\n,;]+/)
                .map(v => v.trim())
                .filter(v => v !== "");

            setContent(values);
        }
    }

    return (
        <div className={`combined_input`}>
            <textarea
                wrap={'soft'}
                value={content.join("\n")}
                onChange={(e) => {
                    const lines = e.target.value.split(/\r?\n/);
                    setContent(lines);
                }}
            />
            <p>Please enter one ISBN per line</p>
            <input
                type={'file'}
                accept={'.csv, .txt'}
                onChange={handleFileChange}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <CustomButton onClick={() => {
                    addBatch(content)
                    close();
                }} children={'Add batch'}/>
                <CustomButton onClick={close} children={'Close'}/>
            </div>
        </div>
    );
}