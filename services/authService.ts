// Fix: Switched from Firebase to a mock API to resolve a blocking configuration issue.
// This allows the application preview to run without needing valid Firebase credentials.
import * as mockApi from './mockApi';
import type { User, Role } from '../types';

// --- Authentication Functions ---

export const signup = async (details: { name: string; email: string; password: string; role: Role; classLevel?: string }): Promise<{ success: boolean; error?: string }> => {
    return mockApi.mockSignup(details);
};

export const login = async (email: string, password: string): Promise<{ success: boolean, error?: string }> => {
    return mockApi.mockLogin(email, password);
};

export const logout = async (): Promise<void> => {
  return mockApi.mockLogout();
};

// --- Session Management ---

/**
 * Sets up a listener for authentication state changes.
 * The callback is fired immediately with the current user state,
 * and again any time the user signs in or out.
 * @param callback The function to call with the user object (or null).
 * @returns An unsubscribe function to detach the listener.
 */
export const onAuthUserChanged = (callback: (user: User | null) => void): (() => void) => {
    return mockApi.onMockAuthUserChanged(callback);
};
