"use client";

import { User, Settings, Heart, Calendar, Shirt } from "lucide-react";
import { useWardrobe } from "@/hooks/useWardrobe";

export default function ProfilePage() {
	const { loading, stats } = useWardrobe();

	return (
		<div className="max-w-4xl mx-auto">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
				<div className="text-center">
					<div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
						<User className="w-10 h-10 text-white" />
					</div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
						Profile
					</h1>
					<p className="text-gray-600 dark:text-gray-300 mb-8">
						Manage your account and preferences
					</p>

					{loading ? (
						<div className="flex justify-center mt-8">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
						</div>
					) : (
						<div className="grid md:grid-cols-4 gap-6 mt-8">
							<div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
								<h3 className="font-semibold text-gray-900 dark:text-gray-100">
									Favorites
								</h3>
								<p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
									{stats.favoriteItems}
								</p>
							</div>

							<div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<Shirt className="w-8 h-8 text-blue-500 mx-auto mb-2" />
								<h3 className="font-semibold text-gray-900 dark:text-gray-100">
									Total Items
								</h3>
								<p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
									{stats.totalItems}
								</p>
							</div>

							<div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
								<h3 className="font-semibold text-gray-900 dark:text-gray-100">
									Total Wears
								</h3>
								<p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
									{stats.totalWears}
								</p>
							</div>

							<div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<Settings className="w-8 h-8 text-purple-500 mx-auto mb-2" />
								<h3 className="font-semibold text-gray-900 dark:text-gray-100">
									Days Active
								</h3>
								<p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
									{stats.daysActive}
								</p>
							</div>
						</div>
					)}

					<div className="mt-8 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
						<p className="text-purple-700 dark:text-purple-300">
							🚧 Profile management features coming in Phase 2! This will
							include user authentication, preferences, and style analytics.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
