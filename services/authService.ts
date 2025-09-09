// services/authService.ts
import { supabase, isUsingMocks } from './firebase';
import { getUserProfile, createUserProfile } from './databaseService';
import type { User, Role } from '../types';
import * as mockApi from './mockApi';

// --- Authentication Functions ---

export const signup = async (details: { name: string; email: string; password: string; role: Role; classLevel?: string }): Promise<{ success: boolean; error?: string }> => {
    if (isUsingMocks) {
        return mockApi.mockSignup(details);
    }

    const { email, password, ...profileDetails } = details;
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        return { success: false, error: error.message };
    }
    
    // If signup is successful, create a corresponding user profile
    if (data.user) {
        try {
            await createUserProfile(data.user.id, details);
            return { success: true };
        } catch (profileError: any) {
            // This is a tricky state. The user is created in auth, but profile failed.
            // For a real app, you might want to handle this more gracefully (e.g., delete the auth user or queue a retry).
            return { success: false, error: profileError.message };
        }
    }

    return { success: false, error: 'An unknown error occurred during signup.' };
};

export const login = async (email: string, password: string): Promise<{ success: boolean, error?: string }> => {
    if (isUsingMocks) {
        return mockApi.mockLogin(email, password);
    }
    
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { success: false, error: error.message };
    }
    
    // onAuthStateChange will handle the rest
    return { success: true };
};

export const signInWithGoogle = async (): Promise<{ success: boolean, error?: string }> => {
    if (isUsingMocks) {
        return mockApi.mockSignInWithGoogle();
    }

    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
};

export const logout = async (): Promise<void> => {
    if (isUsingMocks) {
        await mockApi.mockLogout();
        return;
    }
  await supabase.auth.signOut();
};

// --- Session Management ---

/**
 * Sets up a listener for authentication state changes.
 * When a user logs in, it fetches their full profile from the database.
 * @param callback The function to call with the full User object (or null).
 * @returns An unsubscribe function to detach the listener.
 */
export const onAuthUserChanged = (callback: (user: User | null) => void): (() => void) => {
    if (isUsingMocks) {
        return mockApi.onMockAuthUserChanged(callback);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            try {
                // User is logged in, fetch their full profile
                const userProfile = await getUserProfile(session.user.id);
                callback(userProfile);
            } catch (error) {
                console.error("Error fetching user profile:", error);
                callback(null);
            }
        } else {
            // User is logged out
            callback(null);
        }
    });

    return () => {
        subscription.unsubscribe();
    };
};