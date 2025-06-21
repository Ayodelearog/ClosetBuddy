"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Toast, ToastContainer } from "@/components/Toast";
import { generateUUID } from "@/lib/utils";

interface ToastContextType {
	toasts: Toast[];
	addToast: (toast: Omit<Toast, "id">) => void;
	removeToast: (id: string) => void;
	success: (title: string, message?: string, options?: Partial<Toast>) => void;
	error: (title: string, message?: string, options?: Partial<Toast>) => void;
	warning: (title: string, message?: string, options?: Partial<Toast>) => void;
	info: (title: string, message?: string, options?: Partial<Toast>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
	children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const addToast = (toast: Omit<Toast, "id">) => {
		const id = generateUUID();
		const newToast: Toast = {
			id,
			duration: 5000, // Default 5 seconds
			...toast,
		};

		setToasts((prev) => [...prev, newToast]);
	};

	const removeToast = (id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	};

	const success = (
		title: string,
		message?: string,
		options?: Partial<Toast>
	) => {
		addToast({
			type: "success",
			title,
			message,
			...options,
		});
	};

	const error = (
		title: string,
		message?: string,
		options?: Partial<Toast>
	) => {
		addToast({
			type: "error",
			title,
			message,
			duration: 7000, // Errors stay longer
			...options,
		});
	};

	const warning = (
		title: string,
		message?: string,
		options?: Partial<Toast>
	) => {
		addToast({
			type: "warning",
			title,
			message,
			...options,
		});
	};

	const info = (
		title: string,
		message?: string,
		options?: Partial<Toast>
	) => {
		addToast({
			type: "info",
			title,
			message,
			...options,
		});
	};

	const value: ToastContextType = {
		toasts,
		addToast,
		removeToast,
		success,
		error,
		warning,
		info,
	};

	return (
		<ToastContext.Provider value={value}>
			{children}
			<ToastContainer toasts={toasts} onRemove={removeToast} />
		</ToastContext.Provider>
	);
}

export function useToast() {
	const context = useContext(ToastContext);
	if (context === undefined) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
}
