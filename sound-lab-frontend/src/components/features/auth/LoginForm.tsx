"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { loginUser } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { AxiosError } from 'axios';
// Import hooks from react-spring
import { useSpring, useTransition, useTrail, animated } from '@react-spring/web';

export const LoginForm = () => {
  // --- All original state and logic are preserved ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const authLogin = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await loginUser({ email, password });
      authLogin(response.token);
      router.push('/');
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- Animations ---

  // 1. Spring animation for the main form container
  const formAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(50px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 60 },
  });

  // 2. Trail animation for form elements to appear in sequence
  const formElements = [
    <h2 key="title" className="text-3xl font-bold text-center text-gray-100">
      Welcome Back
    </h2>,
    <p key="subtitle" className="text-center text-gray-400 text-sm -mt-4">
      Log in to continue your journey.
    </p>,
    <div key="email-group">
      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
        Email Address
      </label>
      <Input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="you@example.com"
        disabled={isLoading}
        className="mt-1 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>,
    <div key="password-group">
      <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
        Password
      </label>
      <Input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        placeholder="••••••••"
        disabled={isLoading}
        className="mt-1 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>,
  ];

  const trail = useTrail(formElements.length, {
    from: { opacity: 0, transform: 'translateX(-40px)' },
    to: { opacity: 1, transform: 'translateX(0px)' },
    config: { mass: 1, tension: 500, friction: 40 },
  });

  // 3. Transition animation for the error message
  const errorTransition = useTransition(error, {
    from: { opacity: 0, transform: 'translateY(-10px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(-10px)' },
    config: { duration: 200 },
  });

  return (
    // Main container to center the form with a new background
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 p-4 font-sans">
      <animated.div
        style={formAnimation}
        className="w-full max-w-md p-8 space-y-6 bg-gray-800/40 rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-700/50"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {trail.map((style, index) => (
            <animated.div key={index} style={style}>
              {formElements[index]}
            </animated.div>
          ))}

          {errorTransition((style, item) =>
            item ? (
              <animated.p style={style} className="text-sm font-medium text-red-400 text-center">
                {item}
              </animated.p>
            ) : null
          )}

          <div>
            <Button
              type="submit"
              fullWidth
              disabled={isLoading}
              // Enhanced button styling
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              {isLoading ? <Spinner size="sm" /> : 'Log In'}
            </Button>
          </div>
        </form>
      </animated.div>
    </div>
  );
};