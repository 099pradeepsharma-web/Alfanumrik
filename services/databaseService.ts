import { supabase, isUsingMocks } from './firebase';
import type { User, Role, UserProgress } from '../types';
import * as mockApi from './mockApi';

// Utility to convert camelCase object keys to snake_case for Supabase
const toSnakeCase = (obj: Record<string, any>): Record<string, any> => {
    const newObj: Record<string, any> = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            newObj[snakeKey] = obj[key];
        }
    }
    return newObj;
};


/**
 * Fetches a user's profile from the 'profiles' table.
 * @param uid The user's unique ID.
 * @returns A promise that resolves to the User object or null.
 */
export const getUserProfile = async (uid: string): Promise<User | null> => {
    if (isUsingMocks) {
        // In mock mode, this is only called by the real auth listener, which we bypass.
        // This implementation is a safeguard. The mock auth listener provides the user data directly.
        const currentUser = mockApi.getCurrentUser();
        return currentUser && currentUser.id === uid ? currentUser : null;
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
    
    return data as User | null;
};

/**
 * Creates a new user profile document in the 'profiles' table after signup.
 * @param uid The new user's UID from Supabase Auth.
 * @param details An object containing the user's details.
 */
export const createUserProfile = async (uid: string, details: { name: string; email: string; role: Role; classLevel?: string }): Promise<void> => {
    if (isUsingMocks) {
        // In mock mode, the user profile is created directly in mockSignup.
        return;
    }
    
    const profileData: Partial<User> = {
        id: uid,
        email: details.email,
        name: details.name,
        role: details.role,
        verified: true, // Assuming email verification is handled by Supabase Auth
    };

    if (details.role === 'student') {
        profileData.level = 1;
        profileData.points = 0;
        profileData.classLevel = details.classLevel || '6';
        profileData.completedTopics = [];
        profileData.badges = [];
        profileData.dailyChallengeCompleted = false;
        profileData.lastActivity = new Date().toISOString();
        profileData.weaknesses = [];
        profileData.strengths = [];
    }

    const { error } = await supabase.from('profiles').insert(toSnakeCase(profileData));
    
    if (error) {
        console.error('Error creating user profile:', error);
        throw new Error('Could not create user profile.');
    }
};

/**
 * Updates a student's progress in their profile document.
 * @param uid The student's UID.
 * @param progressUpdate A partial UserProgress object with the fields to update.
 */
export const updateUserProgress = async (uid: string, progressUpdate: Partial<UserProgress>): Promise<void> => {
    if (isUsingMocks) {
        mockApi.updateUserProgressInMockDb(uid, progressUpdate);
        return;
    }

    const updateData = { ...progressUpdate, lastActivity: new Date().toISOString() };

    const { error } = await supabase
        .from('profiles')
        .update(toSnakeCase(updateData))
        .eq('id', uid);

    if (error) {
        console.error('Error updating user progress:', error);
        throw new Error('Could not update user progress.');
    }
};

export const updateUserProfile = async (uid: string, updates: Partial<User>): Promise<User | null> => {
    if (isUsingMocks) {
        return mockApi.mockUpdateUserProfile(uid, updates);
    }
    
    const snakeCaseUpdates = toSnakeCase(updates);
    // If role is changed to non-student, nullify class_level
    if (snakeCaseUpdates.role && snakeCaseUpdates.role !== 'student') {
        snakeCaseUpdates.class_level = null;
    }

    const { data, error } = await supabase
        .from('profiles')
        .update(snakeCaseUpdates)
        .eq('id', uid)
        .select()
        .single();

    if (error) {
        console.error('Error updating user profile:', error);
        throw new Error('Could not update user profile.');
    }
    
    return data as User | null;
};

/**
 * Fetches the full user objects for a teacher's students.
 * @param teacherId The UID of the teacher.
 * @returns A promise that resolves to an array of student User objects.
 */
export const getStudentsForTeacher = async (teacherId: string): Promise<User[]> => {
    if (isUsingMocks) {
        return mockApi.getStudentsForTeacher(teacherId);
    }

    // First, get the teacher's profile to get the list of student IDs.
    const { data: teacher, error: teacherError } = await supabase
        .from('profiles')
        .select('students')
        .eq('id', teacherId)
        .single();
    
    if (teacherError || !teacher || !teacher.students || teacher.students.length === 0) {
        return [];
    }

    const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', teacher.students);

    if (studentsError) {
        console.error('Error fetching students for teacher:', studentsError);
        return [];
    }
    
    return students as User[];
};

/**
 * Fetches the full user objects for a parent's children.
 * @param parentId The UID of the parent.
 * @returns A promise that resolves to an array of child User objects.
 */
export const getChildrenForParent = async (parentId: string): Promise<User[]> => {
    if (isUsingMocks) {
        return mockApi.getChildrenForParent(parentId);
    }

    const { data: parent, error: parentError } = await supabase
        .from('profiles')
        .select('children')
        .eq('id', parentId)
        .single();
    
    if (parentError || !parent || !parent.children || parent.children.length === 0) {
        return [];
    }

    const { data: children, error: childrenError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', parent.children);

    if (childrenError) {
        console.error('Error fetching children for parent:', childrenError);
        return [];
    }

    return children as User[];
};

export const submitFeedback = async (userId: string, rating: number, comments: string): Promise<void> => {
    if (isUsingMocks) {
        return mockApi.mockSubmitFeedback(userId, rating, comments);
    }

    const { error } = await supabase
        .from('feedback')
        .insert({
            user_id: userId,
            rating: rating || null, // Allow null rating if only comments are provided
            comments: comments || null,
        });
    
    if (error) {
        console.error('Error submitting feedback:', error);
        throw new Error('Could not submit feedback.');
    }
};

/**
 * Retrieves cached AI-generated content from the database.
 * @param cacheKey A unique key identifying the content.
 * @returns The cached content object or null if not found.
 */
export const getCachedContent = async (cacheKey: string): Promise<any | null> => {
    if (isUsingMocks) {
        return null;
    }

    const { data, error } = await supabase
        .from('ai_generated_content')
        .select('generated_content')
        .eq('cache_key', cacheKey)
        .single();

    if (error) {
        if (error.code !== 'PGRST116') { // Ignore 'exact one row' error for cache misses
            console.error('Error fetching cached content:', error);
        }
        return null;
    }

    return data ? data.generated_content : null;
};

/**
 * Stores newly generated AI content in the cache.
 * @param cacheKey A unique key for the content.
 * @param contentType The type of content (e.g., 'learning_content').
 * @param content The JSON object to be cached.
 */
export const setCachedContent = async (cacheKey: string, contentType: string, content: any): Promise<void> => {
    if (isUsingMocks) {
        return;
    }

    const { error } = await supabase
        .from('ai_generated_content')
        .insert({
            cache_key: cacheKey,
            content_type: contentType,
            generated_content: content,
        });

    if (error) {
        // It's possible another user cached it in the meantime, so unique key violation is okay.
        if (error.code !== '23505') { // 23505 is unique_violation
            console.error('Error setting cached content:', error);
        }
    }
};