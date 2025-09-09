import React, { useState } from 'react';
import * as authService from '../services/authService';
import Spinner from './Spinner';
import { ArrowRight } from 'lucide-react';
import Logo from './Logo';

const Auth: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGuestLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Using a default mock student user for one-click entry.
            // This works because setting placeholder keys in index.html enables mock mode.
            const { success, error: loginError } = await authService.login('student@test.com', 'password');
            if (!success) {
                // Provide a more helpful error if the mock user isn't found
                if (loginError?.includes('invalid-credential')) {
                    throw new Error('Default guest user not found. Please check mock API data.');
                }
                throw new Error(loginError || 'Failed to log in as guest.');
            }
            // The onAuthUserChanged listener in App.tsx will handle the state update and view change.
        } catch (e: any) {
            setError(e.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800 rounded-xl shadow-2xl animate-fade-in text-center">
                <div>
                    <div className="flex justify-center">
                        <Logo textClassName="text-4xl" />
                    </div>
                     <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                        An adaptive, gamified learning portal for K-12 CBSE students.
                    </p>
                </div>
                
                <div className="pt-6">
                    {isLoading ? (
                        <div className="h-[60px] flex justify-center items-center">
                            <Spinner text="Starting your session..." />
                        </div>
                    ) : (
                        <button 
                            onClick={handleGuestLogin}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 btn-pressable"
                            style={{height: '60px'}}
                        >
                            Start Learning
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    )}
                    {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default Auth;