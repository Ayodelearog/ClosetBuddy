import { createClient } from "@supabase/supabase-js";
import { ClothingItem, UserPreferences, OutfitSuggestion } from "@/types";

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		"Missing Supabase environment variables. Please check your .env.local file and ensure you have:\n" +
			"- NEXT_PUBLIC_SUPABASE_URL\n" +
			"- NEXT_PUBLIC_SUPABASE_ANON_KEY\n\n" +
			"See README.md for setup instructions."
	);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for Supabase
export interface Database {
	public: {
		Tables: {
			clothing_items: {
				Row: ClothingItem;
				Insert: Omit<ClothingItem, "id" | "created_at" | "updated_at">;
				Update: Partial<Omit<ClothingItem, "id" | "created_at" | "updated_at">>;
			};
			user_preferences: {
				Row: UserPreferences;
				Insert: Omit<UserPreferences, "id" | "created_at" | "updated_at">;
				Update: Partial<
					Omit<UserPreferences, "id" | "created_at" | "updated_at">
				>;
			};
			outfit_suggestions: {
				Row: OutfitSuggestion;
				Insert: Omit<OutfitSuggestion, "id" | "created_at">;
				Update: Partial<Omit<OutfitSuggestion, "id" | "created_at">>;
			};
		};
	};
}

// Helper functions for database operations
export class ClothingItemService {
	static async getAll(userId: string) {
		const { data, error } = await supabase
			.from("clothing_items")
			.select("*")
			.eq("user_id", userId)
			.order("created_at", { ascending: false });

		return { data, error };
	}

	static async getById(id: string, userId: string) {
		const { data, error } = await supabase
			.from("clothing_items")
			.select("*")
			.eq("id", id)
			.eq("user_id", userId)
			.single();

		return { data, error };
	}

	static async create(
		item: Database["public"]["Tables"]["clothing_items"]["Insert"]
	) {
		const { data, error } = await supabase
			.from("clothing_items")
			.insert(item)
			.select()
			.single();

		return { data, error };
	}

	static async update(
		id: string,
		updates: Database["public"]["Tables"]["clothing_items"]["Update"]
	) {
		const { data, error } = await supabase
			.from("clothing_items")
			.update(updates)
			.eq("id", id)
			.select()
			.single();

		return { data, error };
	}

	static async delete(id: string, userId: string) {
		const { error } = await supabase
			.from("clothing_items")
			.delete()
			.eq("id", id)
			.eq("user_id", userId);

		return { error };
	}

	static async getByCategory(userId: string, category: string) {
		const { data, error } = await supabase
			.from("clothing_items")
			.select("*")
			.eq("user_id", userId)
			.eq("category", category)
			.order("created_at", { ascending: false });

		return { data, error };
	}

	static async search(userId: string, query: string) {
		const { data, error } = await supabase
			.from("clothing_items")
			.select("*")
			.eq("user_id", userId)
			.or(`name.ilike.%${query}%,brand.ilike.%${query}%,notes.ilike.%${query}%`)
			.order("created_at", { ascending: false });

		return { data, error };
	}
}

// Storage helpers for images
export class StorageService {
	static async uploadImage(file: File, userId: string, itemId: string) {
		const fileExt = file.name.split(".").pop();
		const fileName = `${userId}/${itemId}.${fileExt}`;

		const { error } = await supabase.storage
			.from("clothing-images")
			.upload(fileName, file, {
				cacheControl: "3600",
				upsert: true,
			});

		if (error) return { data: null, error };

		const { data: urlData } = supabase.storage
			.from("clothing-images")
			.getPublicUrl(fileName);

		return { data: { path: fileName, url: urlData.publicUrl }, error: null };
	}

	static async deleteImage(path: string) {
		const { error } = await supabase.storage
			.from("clothing-images")
			.remove([path]);

		return { error };
	}

	static getImageUrl(path: string) {
		const { data } = supabase.storage
			.from("clothing-images")
			.getPublicUrl(path);

		return data.publicUrl;
	}
}

// Auth helpers
export class AuthService {
	static async getCurrentUser() {
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();
		return { user, error };
	}

	static async signInWithEmail(email: string, password: string) {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		return { data, error };
	}

	static async signUpWithEmail(email: string, password: string) {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
		});
		return { data, error };
	}

	static async signOut() {
		const { error } = await supabase.auth.signOut();
		return { error };
	}

	static async resetPassword(email: string) {
		const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/reset-password`,
		});
		return { data, error };
	}

	static async updatePassword(password: string) {
		const { data, error } = await supabase.auth.updateUser({
			password,
		});
		return { data, error };
	}

	static onAuthStateChange(callback: (event: string, session: any) => void) {
		return supabase.auth.onAuthStateChange(callback);
	}
}

// User Preferences helpers
export class UserPreferencesService {
	static async get(userId: string) {
		const { data, error } = await supabase
			.from("user_preferences")
			.select("*")
			.eq("user_id", userId)
			.single();

		return { data, error };
	}

	static async create(
		preferences: Database["public"]["Tables"]["user_preferences"]["Insert"]
	) {
		const { data, error } = await supabase
			.from("user_preferences")
			.insert(preferences)
			.select()
			.single();

		return { data, error };
	}

	static async update(
		userId: string,
		updates: Database["public"]["Tables"]["user_preferences"]["Update"]
	) {
		const { data, error } = await supabase
			.from("user_preferences")
			.update(updates)
			.eq("user_id", userId)
			.select()
			.single();

		return { data, error };
	}

	static async upsert(
		preferences: Database["public"]["Tables"]["user_preferences"]["Insert"]
	) {
		const { data, error } = await supabase
			.from("user_preferences")
			.upsert(preferences, {
				onConflict: "user_id",
			})
			.select()
			.single();

		return { data, error };
	}
}
