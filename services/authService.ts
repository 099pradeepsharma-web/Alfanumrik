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

    const { email, password, name, role, classLevel } = details;
    // Store user-selected details in metadata, so we can access it later
    // to create the profile with the correct role.
    // Fix: Changed Supabase auth method to snake_case to match the expected API.
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
                app_role: role,
                class_level: role === 'student' ? classLevel : null,
            }
        }
    });

    if (error) {
        return { success: false, error: error.message };
    }
    
    // IMPORTANT: Profile creation is now handled by onAuthUserChanged.
    // This makes the flow resilient to email confirmation requirements, as the
    // profile is only created when the user has a valid session for the first time.
    return { success: true };
};

export const login = async (email: string, password: string): Promise<{ success: boolean, error?: string }> => {
    if (isUsingMocks) {
        return mockApi.mockLogin(email, password);
    }
    
    // Fix: Changed Supabase auth method to snake_case to match the expected API.
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

    // Fix: Changed Supabase auth method to snake_case to match the expected API.
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
  // Fix: Changed Supabase auth method to snake_case to match the expected API.
  await supabase.auth.signOut();
};

// --- Session Management ---

/**
 * Sets up a listener for authentication state changes.
 * When a user logs in, it fetches their full profile from the database.
 * If a profile doesn't exist (e.g., first-time login), it creates one
 * using metadata from the auth user record.
 * @param callback The function to call with the full User object (or null).
 * @returns An unsubscribe function to detach the listener.
 */
export const onAuthUserChanged = (callback: (user: User | null) => void): (() => void) => {
    if (isUsingMocks) {
        return mockApi.onMockAuthUserChanged(callback);
    }

    // Fix: Changed Supabase auth method to snake_case to match the expected API.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            try {
                // User is logged in, fetch their full profile
                let userProfile = await getUserProfile(session.user.id);
                
                // If profile doesn't exist, it's a new user. Create one.
                if (!userProfile) {
                    console.log(`No profile found for user ${session.user.id}. Creating a new profile.`);
                    
                    if (!session.user.email) {
                        throw new Error("Cannot create profile for user without an email address.");
                    }

                    // Read role and classLevel from metadata set during signup.
                    // Provide defaults for OAuth users or other edge cases.
                    const roleFromMeta = session.user.user_metadata?.app_role || 'student';
                    const classLevelFromMeta = session.user.user_metadata?.class_level || '6';

                    const newUserDetails = {
                        name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email,
                        email: session.user.email,
                        role: roleFromMeta as Role,
                        classLevel: classLevelFromMeta,
                    };

                    await createUserProfile(session.user.id, newUserDetails);

                    // Fetch the newly created profile to ensure we have the complete data
                    userProfile = await getUserProfile(session.user.id);

                    if (!userProfile) {
                        throw new Error("Failed to retrieve profile after creation. Please contact support.");
                    }
                }

                callback(userProfile);
            } catch (error) {
                console.error("Error handling auth state change:", error);
                // Log out the user if profile creation/fetching fails catastrophically
                await logout(); 
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