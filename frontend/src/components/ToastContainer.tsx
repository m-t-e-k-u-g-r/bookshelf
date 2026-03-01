import {useToastContext} from "../context/ToastContext";

export type ToastMessage = {
    id: number;
    message: string;
};

export default function ToastContainer() {
    const { toasts } = useToastContext();

    return (
        <div>
            {toasts.map((t: any) => (
                <p key={t.id} className={'toast show'}>
                    {t.message}
                </p>
            ))}
        </div>
    )
}