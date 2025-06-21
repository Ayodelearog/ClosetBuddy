"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Shirt,
	Plus,
	Settings,
	User,
	Menu,
	X,
	Sparkles,
	Brain,
	LogOut,
	LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const navigationItems = [
	{
		name: "Wardrobe",
		href: "/wardrobe",
		icon: Shirt,
	},
	{
		name: "Outfits",
		href: "/outfits",
		icon: Sparkles,
	},
	{
		name: "Add Item",
		href: "/add-item",
		icon: Plus,
	},
	{
		name: "Profile",
		href: "/profile",
		icon: User,
	},
	{
		name: "Settings",
		href: "/settings",
		icon: Settings,
	},
	{
		name: "AI Test",
		href: "/ai-test",
		icon: Brain,
	},
];

export function Navigation() {
	const pathname = usePathname();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const { user, signOut } = useAuth();

	const handleSignOut = async () => {
		await signOut();
		setIsMobileMenuOpen(false);
	};

	return (
		<nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<Link href="/" className="flex items-center space-x-2">
						<div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
							<Shirt className="w-5 h-5 text-white" />
						</div>
						<span className="text-xl font-bold text-gray-900 dark:text-gray-100">
							ClosetBuddy
						</span>
					</Link>

					{/* Navigation Links */}
					<div className="hidden md:flex items-center space-x-4">
						{user ? (
							<>
								<div className="flex items-center space-x-6">
									{navigationItems.map((item) => {
										const Icon = item.icon;
										const isActive = pathname === item.href;

										return (
											<Link
												key={item.name}
												href={item.href}
												className={cn(
													"flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
													isActive
														? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
														: "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
												)}>
												<Icon className="w-4 h-4" />
												<span>{item.name}</span>
											</Link>
										);
									})}
								</div>
								<div className="flex items-center space-x-3">
									<span className="text-sm text-gray-600 dark:text-gray-300">
										{user.email}
									</span>
									<button
										onClick={handleSignOut}
										className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
										<LogOut className="w-4 h-4" />
										<span>Sign out</span>
									</button>
								</div>
							</>
						) : (
							<div className="flex items-center space-x-3">
								<Link
									href="/auth/login"
									className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
									<LogIn className="w-4 h-4" />
									<span>Sign in</span>
								</Link>
								<Link
									href="/auth/signup"
									className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
									<User className="w-4 h-4" />
									<span>Sign up</span>
								</Link>
							</div>
						)}
						<ThemeToggle />
					</div>

					{/* Mobile menu button and theme toggle */}
					<div className="md:hidden flex items-center space-x-2">
						<ThemeToggle />
						<button
							type="button"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:text-gray-900 dark:focus:text-gray-100 p-2">
							{isMobileMenuOpen ? (
								<X className="w-6 h-6" />
							) : (
								<Menu className="w-6 h-6" />
							)}
						</button>
					</div>
				</div>

				{/* Mobile Navigation */}
				{isMobileMenuOpen && (
					<div className="md:hidden pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
						<div className="flex flex-col space-y-2">
							{user ? (
								<>
									{navigationItems.map((item) => {
										const Icon = item.icon;
										const isActive = pathname === item.href;

										return (
											<Link
												key={item.name}
												href={item.href}
												onClick={() => setIsMobileMenuOpen(false)}
												className={cn(
													"flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
													isActive
														? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
														: "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
												)}>
												<Icon className="w-4 h-4" />
												<span>{item.name}</span>
											</Link>
										);
									})}
									<div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
										<div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
											{user.email}
										</div>
										<button
											onClick={handleSignOut}
											className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
											<LogOut className="w-4 h-4" />
											<span>Sign out</span>
										</button>
									</div>
								</>
							) : (
								<>
									<Link
										href="/auth/login"
										onClick={() => setIsMobileMenuOpen(false)}
										className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
										<LogIn className="w-4 h-4" />
										<span>Sign in</span>
									</Link>
									<Link
										href="/auth/signup"
										onClick={() => setIsMobileMenuOpen(false)}
										className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
										<User className="w-4 h-4" />
										<span>Sign up</span>
									</Link>
								</>
							)}
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}
