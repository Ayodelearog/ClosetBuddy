"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Shirt } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { PublicOnlyRoute } from "@/components/ProtectedRoute";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const { signIn } = useAuth();
	const { showError, success } = useToast();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!email || !password) {
			showError("Missing fields", "Please enter both email and password");
			return;
		}

		setLoading(true);
		try {
			const { error } = await signIn(email, password);
			
			if (error) {
				showError("Login failed", error.message);
			} else {
				success("Welcome back!", "You have been successfully logged in");
				router.push("/");
			}
		} catch (err) {
			showError("Login failed", "An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<PublicOnlyRoute>
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-md w-full space-y-8">
					{/* Header */}
					<div className="text-center">
						<div className="flex justify-center mb-6">
							<div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
								<Shirt className="w-8 h-8 text-white" />
							</div>
						</div>
						<h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
							Welcome back
						</h2>
						<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
							Sign in to your ClosetBuddy account
						</p>
					</div>

					{/* Form */}
					<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
						<div className="space-y-4">
							{/* Email */}
							<div>
								<label htmlFor="email" className="sr-only">
									Email address
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Mail className="h-5 w-5 text-gray-400" />
									</div>
									<input
										id="email"
										name="email"
										type="email"
										autoComplete="email"
										required
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
										placeholder="Email address"
									/>
								</div>
							</div>

							{/* Password */}
							<div>
								<label htmlFor="password" className="sr-only">
									Password
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Lock className="h-5 w-5 text-gray-400" />
									</div>
									<input
										id="password"
										name="password"
										type={showPassword ? "text" : "password"}
										autoComplete="current-password"
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
										placeholder="Password"
									/>
									<button
										type="button"
										className="absolute inset-y-0 right-0 pr-3 flex items-center"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
										) : (
											<Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
										)}
									</button>
								</div>
							</div>
						</div>

						{/* Forgot password link */}
						<div className="flex items-center justify-end">
							<Link
								href="/auth/forgot-password"
								className="text-sm text-purple-600 hover:text-purple-500"
							>
								Forgot your password?
							</Link>
						</div>

						{/* Submit button */}
						<div>
							<button
								type="submit"
								disabled={loading}
								className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
							>
								{loading ? (
									<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
								) : (
									"Sign in"
								)}
							</button>
						</div>

						{/* Sign up link */}
						<div className="text-center">
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Don't have an account?{" "}
								<Link
									href="/auth/signup"
									className="font-medium text-purple-600 hover:text-purple-500"
								>
									Sign up
								</Link>
							</p>
						</div>
					</form>
				</div>
			</div>
		</PublicOnlyRoute>
	);
}
