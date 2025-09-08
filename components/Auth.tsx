import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import * as authService from '../services/authService';
import type { Role } from '../types';
import { CLASS_LEVELS } from '../constants';

type AuthStep = 'login' | 'signup';

const Auth: React.FC = () => {
    const { login } = useAppContext();
    const [authStep, setAuthStep] = useState<AuthStep>('login');

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>('student');
    const [classLevel, setClassLevel] = useState('6');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const mapFirebaseError = (error: string): string => {
        // The service now returns error.code, but might fall back to error.message
        switch (error) {
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                return 'Invalid email or password.';
            case 'auth/email-already-in-use':
                return 'This email address is already in use.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            case 'auth/operation-not-allowed':
                return 'Email/password sign-in is not enabled in your Firebase project.';
            case 'auth/invalid-api-key':
                 return 'Invalid Firebase API Key. Please check your Firebase configuration.';
            default:
                // Check for generic configuration error messages
                if (error.includes("API key") || error.includes("project")) {
                    return 'Firebase configuration error. Please check your setup in services/firebase.ts.';
                }
                return 'An unexpected error occurred. Please try again.';
        }
    };


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }
        setIsLoading(true);
        const result = await authService.login(email, password);
        setIsLoading(false);

        if (!result.success && result.error) {
            setError(mapFirebaseError(result.error));
        }
        // On successful login, the onAuthUserChanged listener in App.tsx will handle navigation.
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        if (!name || !email || !password) {
            setError("Name, email, and password are required.");
            return;
        }
        setIsLoading(true);
        const result = await authService.signup({ name, email, password, role, classLevel: role === 'student' ? classLevel : undefined });
        setIsLoading(false);

        if (result.success) {
            setSuccessMessage('Account created! Please log in to continue.');
            setAuthStep('login');
        } else if (result.error) {
            setError(mapFirebaseError(result.error));
        }
    };
    
    const renderForm = () => {
        const isLogin = authStep === 'login';

        return (
            <>
                 <div className="text-center">
                     <p className="mt-2 text-slate-600 dark:text-slate-300">
                        {isLogin ? 'Welcome back! Please log in.' : 'Create your account to start learning.'}
                    </p>
                </div>
                
                {isLogin && (
                    <div className="my-4 text-center text-sm text-slate-500 dark:text-slate-400 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
                        <p className="font-semibold text-slate-600 dark:text-slate-300">Demo Accounts</p>
                        <p>Student: <code className="font-mono bg-slate-200 dark:bg-slate-600 px-1 rounded">student@test.com</code></p>
                        <p>Teacher: <code className="font-mono bg-slate-200 dark:bg-slate-600 px-1 rounded">teacher@test.com</code></p>
                        <p>Parent: <code className="font-mono bg-slate-200 dark:bg-slate-600 px-1 rounded">parent@test.com</code></p>
                        <p className="text-xs mt-1">(Any password will work)</p>
                    </div>
                )}

                 <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                            required
                        />
                    )}
                     <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                        required
                    />
                     <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                        required
                    />

                    {!isLogin && (
                        <>
                            <select value={role} onChange={e => setRole(e.target.value as Role)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200">
                                <option value="student">I am a Student</option>
                                <option value="teacher">I am a Teacher</option>
                                <option value="parent">I am a Parent</option>
                            </select>
                            
                            {role === 'student' && (
                                <select value={classLevel} onChange={e => setClassLevel(e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200">
                                    {CLASS_LEVELS.map(level => <option key={level} value={level}>Class {level}</option>)}
                                </select>
                            )}
                        </>
                    )}
                    
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    {successMessage && <p className="text-sm text-green-600 dark:text-green-400 text-center">{successMessage}</p>}


                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (isLogin ? 'Logging in...' : 'Signing up...') : (isLogin ? 'Log In' : 'Sign Up')}
                    </button>
                </form>

                <div className="text-center">
                    <button 
                        onClick={() => { setError(null); setSuccessMessage(null); setAuthStep(isLogin ? 'signup' : 'login'); }} 
                        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                        disabled={isLoading}
                    >
                        {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
                    </button>
                </div>
            </>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-xl shadow-2xl animate-fade-in">
                <div className="text-center">
                     <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                        <span role="img" aria-label="brain">🧠</span> AlfaNumric
                    </h1>
                </div>
                {renderForm()}
            </div>
        </div>
    );
};

export default Auth;