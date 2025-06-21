"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Toast {
	id: string;
	type: "success" | "error" | "warning" | "info";
	title: string;
	message?: string;
	duration?: number;
	action?: {
		label: string;
		onClick: () => void;
	};
}

interface ToastProps {
	toast: Toast;
	onRemove: (id: string) => void;
}

const toastIcons = {
	success: CheckCircle,
	error: AlertCircle,
	warning: AlertTriangle,
	info: Info,
};

const toastStyles = {
	success: {
		container:
			"bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
		icon: "text-green-600 dark:text-green-400",
		title: "text-green-800 dark:text-green-200",
		message: "text-green-700 dark:text-green-300",
		button:
			"text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200",
	},
	error: {
		container:
			"bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
		icon: "text-red-600 dark:text-red-400",
		title: "text-red-800 dark:text-red-200",
		message: "text-red-700 dark:text-red-300",
		button:
			"text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200",
	},
	warning: {
		container:
			"bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
		icon: "text-yellow-600 dark:text-yellow-400",
		title: "text-yellow-800 dark:text-yellow-200",
		message: "text-yellow-700 dark:text-yellow-300",
		button:
			"text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200",
	},
	info: {
		container:
			"bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
		icon: "text-blue-600 dark:text-blue-400",
		title: "text-blue-800 dark:text-blue-200",
		message: "text-blue-700 dark:text-blue-300",
		button:
			"text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200",
	},
};

export function ToastComponent({ toast, onRemove }: ToastProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [isExiting, setIsExiting] = useState(false);

	const Icon = toastIcons[toast.type];
	const styles = toastStyles[toast.type];

	useEffect(() => {
		// Trigger entrance animation
		const timer = setTimeout(() => setIsVisible(true), 10);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (toast.duration && toast.duration > 0) {
			const timer = setTimeout(() => {
				handleRemove();
			}, toast.duration);
			return () => clearTimeout(timer);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toast.duration]); // handleRemove is stable, safe to omit from deps

	const handleRemove = () => {
		setIsExiting(true);
		setTimeout(() => {
			onRemove(toast.id);
		}, 300);
	};

	return (
		<div
			className={cn(
				"transform transition-all duration-300 ease-in-out",
				"max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto",
				"border border-gray-200 dark:border-gray-700",
				styles.container,
				isVisible && !isExiting
					? "translate-x-0 opacity-100"
					: "translate-x-full opacity-0"
			)}>
			<div className="p-4">
				<div className="flex items-start">
					<div className="flex-shrink-0">
						<Icon className={cn("h-5 w-5", styles.icon)} />
					</div>
					<div className="ml-3 w-0 flex-1">
						<p className={cn("text-sm font-medium", styles.title)}>
							{toast.title}
						</p>
						{toast.message && (
							<p className={cn("mt-1 text-sm", styles.message)}>
								{toast.message}
							</p>
						)}
						{toast.action && (
							<div className="mt-3">
								<button
									onClick={toast.action.onClick}
									className={cn(
										"text-sm font-medium underline",
										styles.button
									)}>
									{toast.action.label}
								</button>
							</div>
						)}
					</div>
					<div className="ml-4 flex-shrink-0 flex">
						<button
							onClick={handleRemove}
							className={cn(
								"inline-flex text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",
								"focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 rounded-md"
							)}>
							<span className="sr-only">Close</span>
							<X className="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

interface ToastContainerProps {
	toasts: Toast[];
	onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
	return (
		<div
			aria-live="assertive"
			className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50">
			<div className="w-full flex flex-col items-center space-y-4 sm:items-end">
				{toasts.map((toast) => (
					<ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
				))}
			</div>
		</div>
	);
}
