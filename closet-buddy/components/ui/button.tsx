import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
	size?: 'sm' | 'md' | 'lg';
	children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
	variant = 'primary',
	size = 'md',
	className,
	children,
	disabled,
	...props
}) => {
	const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
	
	const variantClasses = {
		primary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 disabled:bg-purple-300',
		secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300',
		outline: 'border border-purple-600 text-purple-600 hover:bg-purple-50 focus:ring-purple-500 disabled:border-purple-300 disabled:text-purple-300',
		ghost: 'text-purple-600 hover:bg-purple-50 focus:ring-purple-500 disabled:text-purple-300'
	};
	
	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-sm',
		lg: 'px-6 py-3 text-base'
	};
	
	return (
		<button
			className={clsx(
				baseClasses,
				variantClasses[variant],
				sizeClasses[size],
				disabled && 'cursor-not-allowed opacity-50',
				className
			)}
			disabled={disabled}
			{...props}
		>
			{children}
		</button>
	);
};
