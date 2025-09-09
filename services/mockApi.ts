import type { User, Role, UserProgress } from '../types';

// In-memory store for mock data
// This acts as our single source of truth, simulating a database.
const MOCK_USERS: { [id:string]: User } = {
    // Default student, can be used for testing signup or as a template
    'student@test.com': {
        id: 'student@test.com',
        email: 'student@test.com',
        name: 'Kian Student',
        role: 'student',
        verified: true,
        level: 3,
        points: 250,
        classLevel: '8',
        completedTopics: ['cell_structure_8'],
        badges: ['first_steps'],
        dailyChallengeCompleted: false,
        lastActivity: '4 hours ago',
        weaknesses: ['Chemical Reactions'],
        strengths: ['Cell Biology']
    },
    // More detailed, linked students
    'rohan@test.com': {
        id: 'rohan@test.com',
        email: 'rohan@test.com',
        name: 'Rohan Sharma',
        role: 'student',
        verified: true,
        level: 4,
        points: 320,
        classLevel: '8',
        completedTopics: ['linear_equations_8', 'squares_roots_8'],
        badges: ['first_steps', 'quiz_whiz'],
        dailyChallengeCompleted: true,
        lastActivity: '2 hours ago',
        weaknesses: ['Algebraic Equations'],
        strengths: ['Geometry', 'Fractions'],
        progress: 75,
    },
    'priya@test.com': {
        id: 'priya@test.com',
        email: 'priya@test.com',
        name: 'Priya Patel',
        role: 'student',
        verified: true,
        level: 5,
        points: 450,
        classLevel: '8',
        completedTopics: ['cell_structure_8', 'microorganisms_8'],
        badges: ['first_steps', 'daily_streak'],
        dailyChallengeCompleted: false,
        lastActivity: '1 day ago',
        weaknesses: ['Chemical Formulas'],
        strengths: ['Biology', 'Physics'],
        progress: 85,
    },
    'amit@test.com': {
        id: 'amit@test.com',
        email: 'amit@test.com',
        name: 'Amit Singh',
        role: 'student',
        verified: true,
        level: 3,
        points: 210,
        classLevel: '8',
        completedTopics: ['indian_constitution_8'],
        badges: ['first_steps'],
        dailyChallengeCompleted: true,
        lastActivity: '3 days ago',
        weaknesses: ['Historical Dates'],
        strengths: ['Geography'],
        progress: 60,
    },
    // Teacher linked to the students above
    'teacher@test.com': {
        id: 'teacher@test.com',
        email: 'teacher@test.com',
        name: 'Dr. Evelyn Reed',
        role: 'teacher',
        verified: true,
        students: ['rohan@test.com', 'priya@test.com', 'amit@test.com'],
    },
    // Parent linked to some of the students
    'parent@test.com': {
        id: 'parent@test.com',
        email: 'parent@test.com',
        name: 'Sam Parent',
        role: 'parent',
        verified: true,
        children: ['rohan@test.com', 'priya@test.com'],
    },
    // Mock user for Google Sign-In
    'priya.google@test.com': {
        id: 'priya.google@test.com',
        email: 'priya.google@test.com',
        name: 'Priya (from Google)',
        role: 'student',
        verified: true,
        level: 2,
        points: 150,
        classLevel: '7',
        completedTopics: ['integers_7'],
        badges: ['first_steps'],
        dailyChallengeCompleted: false,
        lastActivity: '5 hours ago',
        weaknesses: ['Simple Equations'],
        strengths: ['Integers']
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
            const parsedUser = JSON.parse(sessionUser);
            // Return the latest data from our "DB"
            return MOCK_USERS[parsedUser.id] || null;
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
    
    const newUser: User = {
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
        newUser.badges = [];
        newUser.dailyChallengeCompleted = false;
        newUser.lastActivity = 'Just now';
        newUser.weaknesses = [];
        newUser.strengths = [];
    }
    
    MOCK_USERS[email] = newUser;
    return { success: true };
};

export const mockLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(res => setTimeout(res, 500)); // Simulate network delay
    const user = MOCK_USERS[email];
    if (user) {
        // We only store the ID in session, to force re-fetching the full user object
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id }));
        notifyAuthChange();
        return { success: true };
    }
    return { success: false, error: 'auth/invalid-credential' };
};

export const mockSignInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    await new Promise(res => setTimeout(res, 500)); // Simulate network delay
    const googleUserEmail = 'priya.google@test.com';
    const user = MOCK_USERS[googleUserEmail];
    
    if (user) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id }));
        notifyAuthChange();
        return { success: true };
    } else {
        // This case shouldn't happen with our mock setup, but good practice.
        return { success: false, error: 'auth/user-not-found' };
    }
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

// --- Data Sync Functions ---

/**
 * Updates a student's progress in the main MOCK_USERS store.
 * This is the key to the "auto-sync" feature.
 * @param userId The ID of the student to update.
 * @param progress The progress object to merge.
 */
export const updateUserProgressInMockDb = (userId: string, progress: Partial<UserProgress>) => {
    if (MOCK_USERS[userId] && MOCK_USERS[userId].role === 'student') {
        MOCK_USERS[userId] = { ...MOCK_USERS[userId], ...progress };
    }
};

export const mockUpdateUserProfile = async (userId: string, updates: Partial<User>): Promise<User | null> => {
    await new Promise(res => setTimeout(res, 300));
    if (MOCK_USERS[userId]) {
        MOCK_USERS[userId] = { ...MOCK_USERS[userId], ...updates };
        // When role changes, we might need to null out student-specific fields
        if (updates.role && updates.role !== 'student') {
            delete MOCK_USERS[userId].classLevel;
        }
        notifyAuthChange(); // Crucial for UI update
        return MOCK_USERS[userId];
    }
    return null;
};

/**
 * Fetches the full user objects for a teacher's students.
 * @param teacherId The ID of the teacher.
 * @returns A promise that resolves to an array of student User objects.
 */
export const getStudentsForTeacher = async (teacherId: string): Promise<User[]> => {
    await new Promise(res => setTimeout(res, 300)); // Simulate network delay
    const teacher = MOCK_USERS[teacherId];
    if (teacher && teacher.role === 'teacher' && teacher.students) {
        return teacher.students.map(studentId => MOCK_USERS[studentId]).filter(Boolean);
    }
    return [];
};

/**
 * Fetches the full user objects for a parent's children.
 * @param parentId The ID of the parent.
 * @returns A promise that resolves to an array of child User objects.
 */
export const getChildrenForParent = async (parentId: string): Promise<User[]> => {
    await new Promise(res => setTimeout(res, 300)); // Simulate network delay
    const parent = MOCK_USERS[parentId];
    if (parent && parent.role === 'parent' && parent.children) {
        return parent.children.map(childId => MOCK_USERS[childId]).filter(Boolean);
    }
    return [];
};

export const mockSubmitFeedback = async (userId: string, rating: number, comments: string): Promise<void> => {
    await new Promise(res => setTimeout(res, 500)); // Simulate network delay
    console.log("--- MOCK FEEDBACK SUBMITTED ---");
    console.log("User ID:", userId);
    console.log("Rating:", rating);
    console.log("Comments:", comments);
    console.log("-------------------------------");
    // In mock mode, we just resolve successfully.
    return;
};
