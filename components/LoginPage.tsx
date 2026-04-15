'use client';

import { useState } from 'react';
import Image from 'next/image';
import { supabase, hasSupabase } from '@/lib/supabase';
import { Lock, Mail } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSupabase || !supabase) {
      setError('Supabase is not configured. Please check your environment variables.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Image 
            src="https://img1.wsimg.com/isteam/ip/97a5d835-7b16-4991-b3c6-3d6956b6b82b/ESBOC%CC%A7O-STAR-CLEANING_full.png" 
            alt="Star Cleaning SC" 
            width={200} 
            height={100} 
            className="object-contain"
            referrerPolicy="no-referrer"
            priority
          />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-zinc-900 tracking-tight">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600">
          Enterprise Quote Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-zinc-200/50 sm:rounded-2xl sm:px-10 border border-zinc-200">
          <form className="space-y-6" onSubmit={handleAuth}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-zinc-700">Email address</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-zinc-300 rounded-lg shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors"
                  placeholder="admin@starcleaning.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-zinc-300 rounded-lg shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Authenticating...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-zinc-500">
                  {isSignUp ? 'Already have an account?' : 'Need an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full flex justify-center py-2.5 px-4 border border-zinc-300 rounded-lg shadow-sm text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
              >
                {isSignUp ? 'Sign in instead' : 'Create a new account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
