"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
	const [isDark, setIsDark] = useState(false);
	const [mounted, setMounted] = useState(false);

	// Check for saved theme preference or default to system preference
	useEffect(() => {
		setMounted(true);

		const savedTheme = localStorage.getItem("theme");
		const systemPrefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)"
		).matches;

		if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
			setIsDark(true);
			document.documentElement.classList.add("dark");
		} else {
			setIsDark(false);
			document.documentElement.classList.remove("dark");
		}
	}, []);

	// Listen for system theme changes
	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const handleChange = (e: MediaQueryListEvent) => {
			if (!localStorage.getItem("theme")) {
				setIsDark(e.matches);
				if (e.matches) {
					document.documentElement.classList.add("dark");
				} else {
					document.documentElement.classList.remove("dark");
				}
			}
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, []);

	const toggleTheme = () => {
		const newTheme = !isDark;
		setIsDark(newTheme);

		if (newTheme) {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}

		// Force a re-render by dispatching a custom event
		window.dispatchEvent(
			new CustomEvent("themechange", {
				detail: { theme: newTheme ? "dark" : "light" },
			})
		);
	};

	// Prevent hydration mismatch by not rendering until mounted
	if (!mounted) {
		return (
			<button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 w-10 h-10">
				<div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
			</button>
		);
	}

	return (
		<button
			onClick={toggleTheme}
			className={`p-2 rounded-lg transition-colors duration-200 ${
				isDark
					? "bg-gray-700 text-gray-300 hover:bg-gray-600"
					: "bg-gray-100 text-gray-700 hover:bg-gray-200"
			}`}
			title={isDark ? "Switch to light mode" : "Switch to dark mode"}
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
			{isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
		</button>
	);
}
