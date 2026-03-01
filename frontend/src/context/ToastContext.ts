import {type Context, createContext, useContext} from "react";
import type {ToastMessage} from "../components/ToastContainer";

export const ToastContext: Context<ToastContextType | undefined> = createContext<ToastContextType | undefined>(undefined)
type ToastContextType = {
    toasts: ToastMessage[];
    addToast: (message: string) => void;
};

export function useToastContext(): ToastContextType {
    const context: ToastContextType | undefined =  useContext(ToastContext);

    if (context === undefined) {
        throw new Error('useToastContext must be used within a ToastProvider');
    }
    return context;
}