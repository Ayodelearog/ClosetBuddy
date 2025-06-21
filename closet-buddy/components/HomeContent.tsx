"use client";

import { useAuth } from "@/contexts/AuthContext";
import { QuickOutfitSuggestions } from "@/components/QuickOutfitSuggestions";

export function HomeContent() {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="text-center py-12">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
					Sign in to see your outfit suggestions
				</h2>
				<p className="text-gray-600 dark:text-gray-300 mb-6">
					Create an account or sign in to start building your digital wardrobe
					and get personalized outfit recommendations.
				</p>
			</div>
		);
	}

	return (
		<>
			{/* Quick Outfit Suggestions */}
			<div className="mb-12">
				<QuickOutfitSuggestions userId={user.id} />
			</div>
		</>
	);
}
