import Link from "next/link";
import { Shirt, Plus, Sparkles, Cloud, Heart } from "lucide-react";
import { HomeContent } from "@/components/HomeContent";

export default function Home() {
	return (
		<div className="max-w-6xl mx-auto">
			{/* Hero Section */}
			<div className="text-center py-12">
				<div className="flex justify-center mb-6">
					<div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
						<Shirt className="w-8 h-8 text-white" />
					</div>
				</div>
				<h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
					Welcome to{" "}
					<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
						ClosetBuddy
					</span>
				</h1>
				<p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
					Your AI-powered wardrobe assistant that suggests perfect outfits based
					on weather, occasion, and your personal style.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Link
						href="/add-item"
						className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl">
						<Plus className="w-5 h-5 mr-2" />
						Add Your First Item
					</Link>
					<Link
						href="/wardrobe"
						className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
						<Shirt className="w-5 h-5 mr-2" />
						View Wardrobe
					</Link>
				</div>
			</div>

			{/* Authentication-aware content */}
			<HomeContent />

			{/* Features Section */}
			<div className="grid md:grid-cols-3 gap-8 py-12">
				<div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
					<div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
						<Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
					</div>
					<h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
						AI-Powered Suggestions
					</h3>
					<p className="text-gray-600 dark:text-gray-300">
						Get personalized outfit recommendations based on your style
						preferences and the occasion.
					</p>
				</div>

				<div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
					<div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
						<Cloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />
					</div>
					<h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
						Weather-Aware
					</h3>
					<p className="text-gray-600 dark:text-gray-300">
						Never be caught off-guard by the weather. Get outfit suggestions
						that match the forecast.
					</p>
				</div>

				<div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
					<div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
						<Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
					</div>
					<h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
						Personal Style
					</h3>
					<p className="text-gray-600 dark:text-gray-300">
						Build your digital wardrobe and let AI learn your preferences for
						better suggestions.
					</p>
				</div>
			</div>

			{/* Getting Started Section */}
			<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 my-12">
				<h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-8">
					Get Started in 3 Easy Steps
				</h2>
				<div className="grid md:grid-cols-3 gap-8">
					<div className="text-center">
						<div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
							1
						</div>
						<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
							Upload Your Clothes
						</h3>
						<p className="text-gray-600 dark:text-gray-300">
							Take photos of your clothing items and add them to your digital
							wardrobe.
						</p>
					</div>
					<div className="text-center">
						<div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
							2
						</div>
						<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
							Set Your Preferences
						</h3>
						<p className="text-gray-600 dark:text-gray-300">
							Tell us about your style preferences, favorite colors, and
							occasions.
						</p>
					</div>
					<div className="text-center">
						<div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
							3
						</div>
						<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
							Get Suggestions
						</h3>
						<p className="text-gray-600 dark:text-gray-300">
							Receive AI-powered outfit recommendations tailored to your needs.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
