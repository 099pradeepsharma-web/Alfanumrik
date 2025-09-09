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

    // Derived state for logic
    const isLogin = authStep === 'login';
    const isNonStudentSignup = authStep === 'signup' && role !== 'student';
    
    const mapAuthErrorToUserMessage = (error: string): string => {
        const lowerCaseError = error.toLowerCase();

        if (lowerCaseError.includes('email not confirmed')) {
            return 'Please check your inbox and confirm your email address before logging in.';
        }
        if (lowerCaseError.includes('invalid login credentials')) {
            return 'Invalid email or password. Please double-check your credentials.';
        }
        if (lowerCaseError.includes('user already registered')) {
            return 'An account with this email already exists. Please log in instead.';
        }
        if (lowerCaseError.includes('password should be at least 6 characters')) {
            return 'Your password is too weak. It must be at least 6 characters long.';
        }
        if (lowerCaseError.includes('unable to validate email address')) {
            return 'Please enter a valid email address.';
        }
        if (lowerCaseError.includes('network request failed')) {
            return 'Could not connect to the authentication service. Please check your internet connection.';
        }
        // Default message for unhandled errors
        return 'An unexpected error occurred. Please try again.';
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
            setError(mapAuthErrorToUserMessage(result.error));
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
            setSuccessMessage('Account created! A confirmation email has been sent. Please log in to continue.');
            setAuthStep('login');
        } else if (result.error) {
            setError(mapAuthErrorToUserMessage(result.error));
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);
        const result = await authService.signInWithGoogle();
        setIsLoading(false);

        if (!result.success && result.error) {
            setError(mapAuthErrorToUserMessage(result.error || 'Google sign-in failed.'));
        }
        // Success is handled by the auth listener.
    };
    
    const renderForm = () => {
        return (
            <>
                 <div className="text-center">
                     <p className="mt-2 text-slate-600 dark:text-slate-300">
                        {isLogin ? 'Welcome back! Please log in.' : 'Create your account to start learning.'}
                    </p>
                </div>

                 <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4 pt-4">
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
                        className="w-full flex justify-center items-center px-4 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed btn-pressable"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>{isLogin ? 'Logging in...' : 'Signing up...'}</span>
                            </>
                        ) : (isLogin ? 'Log In' : 'Sign Up')}
                    </button>
                </form>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-300 dark:border-slate-600"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    {isNonStudentSignup && (
                        <p className="text-xs text-center text-slate-500 dark:text-slate-400 px-2 animate-fade-in">
                            Teacher and Parent accounts must be created using email and password.
                        </p>
                    )}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading || isNonStudentSignup}
                        className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed btn-pressable"
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.618-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.14,44,30.63,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        </svg>
                        Sign in with Google
                    </button>
                </div>


                <div className="text-center mt-4">
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
            <div className="w-full max-w-md p-8 space-y-4 bg-white dark:bg-slate-800 rounded-xl shadow-2xl animate-fade-in">
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