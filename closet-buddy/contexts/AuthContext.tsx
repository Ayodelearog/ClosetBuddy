"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { AuthService } from "@/lib/supabase";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	signIn: (email: string, password: string) => Promise<{ error: any }>;
	signUp: (email: string, password: string) => Promise<{ error: any }>;
	signOut: () => Promise<void>;
	resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Get initial session
		const getInitialSession = async () => {
			const { user } = await AuthService.getCurrentUser();
			setUser(user);
			setLoading(false);
		};

		getInitialSession();

		// Listen for auth changes
		const {
			data: { subscription },
		} = AuthService.onAuthStateChange(async (event, session) => {
			console.log("Auth state changed:", event, session?.user?.email);
			setUser(session?.user ?? null);
			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	const signIn = async (email: string, password: string) => {
		const { error } = await AuthService.signInWithEmail(email, password);
		return { error };
	};

	const signUp = async (email: string, password: string) => {
		const { error } = await AuthService.signUpWithEmail(email, password);
		return { error };
	};

	const signOut = async () => {
		await AuthService.signOut();
		setUser(null);
	};

	const resetPassword = async (email: string) => {
		const { error } = await AuthService.resetPassword(email);
		return { error };
	};

	const value = {
		user,
		loading,
		signIn,
		signUp,
		signOut,
		resetPassword,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

// Helper hook to get current user ID
export function useUserId(): string | null {
	const { user } = useAuth();
	return user?.id ?? null;
}
