import type { User, Role } from '../types';

// In-memory store for mock data
// We add more users to this store to allow for dynamic signup.
const MOCK_USERS: { [id: string]: User & { completedTopics?: string[] } } = {
    'student@test.com': {
        id: 'student@test.com',
        email: 'student@test.com',
        name: 'Kian Student',
        role: 'student',
        verified: true,
        level: 3,
        points: 250,
        classLevel: '8',
        completedTopics: ['cell_structure_8'], // Pre-complete one topic for demo
    },
    'teacher@test.com': {
        id: 'teacher@test.com',
        email: 'teacher@test.com',
        name: 'Dr. Evelyn Reed',
        role: 'teacher',
        verified: true,
        students: ['student1', 'student2', 'student3'],
    },
    'parent@test.com': {
        id: 'parent@test.com',
        email: 'parent@test.com',
        name: 'Sam Parent',
        role: 'parent',
        verified: true,
        children: ['child1', 'child2'],
    },
};

const SESSION_KEY = 'mockUserSession';

let onAuthChangeCallback: ((user: User | null) => void) | null = null;

const notifyAuthChange = () => {
    if (onAuthChangeCallback) {
        const user = getCurrentUser();
        onAuthChangeCallback(user);
    }
}

export const getCurrentUser = (): User | null => {
    const sessionUser = sessionStorage.getItem(SESSION_KEY);
    if (sessionUser) {
        try {
            return JSON.parse(sessionUser);
        } catch (e) {
            return null;
        }
    }
    return null;
}

export const mockSignup = async (details: { name: string; email: string; password: string; role: Role; classLevel?: string }): Promise<{ success: boolean; error?: string }> => {
    await new Promise(res => setTimeout(res, 500)); // Simulate network delay
    const { email, name, role, classLevel } = details;
    if (MOCK_USERS[email]) {
        return { success: false, error: 'auth/email-already-in-use' };
    }
    
    const newUser: User & { completedTopics?: string[] } = {
        id: email,
        email,
        name,
        role,
        verified: true, // Auto-verify for mock
    };

    if (role === 'student') {
        newUser.level = 1;
        newUser.points = 0;
        newUser.classLevel = classLevel || '6';
        newUser.completedTopics = [];
    }
    
    MOCK_USERS[email] = newUser;
    return { success: true };
};

export const mockLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(res => setTimeout(res, 500)); // Simulate network delay
    const user = MOCK_USERS[email];
    if (user) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
        notifyAuthChange();
        return { success: true };
    }
    return { success: false, error: 'auth/invalid-credential' };
};

export const mockLogout = async (): Promise<void> => {
    sessionStorage.removeItem(SESSION_KEY);
    notifyAuthChange();
};

export const onMockAuthUserChanged = (callback: (user: User | null) => void): (() => void) => {
    onAuthChangeCallback = callback;
    // Immediately call with current state to simulate Firebase's behavior
    notifyAuthChange();
    
    // Return an unsubscribe function
    return () => {
        onAuthChangeCallback = null;
    };
};