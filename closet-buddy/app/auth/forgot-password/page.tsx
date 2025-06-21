"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Shirt } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { PublicOnlyRoute } from "@/components/ProtectedRoute";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);
	const { resetPassword } = useAuth();
	const { showError, success } = useToast();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!email) {
			showError("Missing email", "Please enter your email address");
			return;
		}

		setLoading(true);
		try {
			const { error } = await resetPassword(email);
			
			if (error) {
				showError("Reset failed", error.message);
			} else {
				setSent(true);
				success(
					"Reset link sent", 
					"Check your email for a password reset link"
				);
			}
		} catch (err) {
			showError("Reset failed", "An unexpected error occurred");
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
							{sent ? "Check your email" : "Forgot your password?"}
						</h2>
						<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
							{sent 
								? "We've sent you a password reset link"
								: "Enter your email address and we'll send you a reset link"
							}
						</p>
					</div>

					{!sent ? (
						<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

							<div>
								<button
									type="submit"
									disabled={loading}
									className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
								>
									{loading ? (
										<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
									) : (
										"Send reset link"
									)}
								</button>
							</div>

							<div className="text-center">
								<Link
									href="/auth/login"
									className="inline-flex items-center text-sm text-purple-600 hover:text-purple-500"
								>
									<ArrowLeft className="w-4 h-4 mr-2" />
									Back to sign in
								</Link>
							</div>
						</form>
					) : (
						<div className="mt-8 space-y-6">
							<div className="text-center">
								<div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
									<Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
								</div>
								<p className="text-gray-600 dark:text-gray-300 mb-6">
									If an account with that email exists, you'll receive a password reset link shortly.
								</p>
								<Link
									href="/auth/login"
									className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
								>
									<ArrowLeft className="w-4 h-4 mr-2" />
									Back to sign in
								</Link>
							</div>
						</div>
					)}
				</div>
			</div>
		</PublicOnlyRoute>
	);
}
