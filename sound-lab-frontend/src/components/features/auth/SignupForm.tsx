"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signupUser } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { AxiosError } from 'axios';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

export const SignupForm = () => {
  // --- All original state and logic are preserved ---
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signupUser({ username, email, password });
      router.push('/login?signup=success'); // Redirect to login after successful signup
    } catch (err) {
      let errorMessage = 'Signup failed. Please try again.';
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Framer Motion Animation Variants (Simplified for new theme) ---
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    // Set the base background to match the rest of the application.
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F3EFEA] p-4 font-sans">
        
        {/* Consistent header link to go back to the homepage */}
        <div className="absolute top-0 left-0 p-4">
            <Link href="/" className="text-2xl font-black tracking-tighter text-[#212121]">
                SOUND LAB
            </Link>
        </div>

        {/* Main form container, styled for a clean, professional look. */}
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md p-8 md:p-12 space-y-6 bg-white border border-neutral-200"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Title */}
                <motion.div variants={itemVariants} className="text-center">
                    <h2 className="text-5xl font-black text-[#212121] tracking-tighter">
                        JOIN US
                    </h2>
                    <p className="mt-2 text-neutral-500">
                        Create an account to start listening.
                    </p>
                </motion.div>
                
                {/* Username Field */}
                <motion.div variants={itemVariants}>
                    <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-1">
                        Username
                    </label>
                    <Input
                        id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                        required placeholder="your_username" disabled={isLoading}
                        className="h-12 bg-transparent border-2 border-neutral-300 text-base rounded-none focus:border-[#212121] transition-colors w-full"
                    />
                </motion.div>

                {/* Email Field */}
                <motion.div variants={itemVariants}>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                        Email Address
                    </label>
                    <Input
                        id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        required placeholder="you@example.com" disabled={isLoading}
                        className="h-12 bg-transparent border-2 border-neutral-300 text-gray-800 rounded-none focus:border-[#212121] transition-colors w-full"
                    />
                </motion.div>

                {/* Password Field */}
                <motion.div variants={itemVariants}>
                    <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                        Password
                    </label>
                    <Input
                        id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        required placeholder="••••••••" disabled={isLoading}
                        className="h-12 bg-transparent border-2 border-neutral-300 text-base rounded-none focus:border-[#212121] transition-colors w-full"
                    />
                </motion.div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="text-sm font-medium text-red-700 text-center bg-red-100 p-3 border border-red-300"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Submit Button */}
                <motion.div variants={itemVariants} className="pt-2">
                    <Button
                        type="submit" fullWidth disabled={isLoading}
                        className="h-12 text-base bg-[#D63426] text-white rounded-none hover:bg-[#212121] transition-colors"
                    >
                        {isLoading ? <Spinner size="sm" /> : 'Create Account'}
                    </Button>
                </motion.div>

                {/* Additional Links Section */}
                <motion.div variants={itemVariants} className="text-center pt-2">
                    <p className="text-sm text-neutral-500">
                        Already have an account?{' '}
                        <Link href="/login" className="font-bold text-[#212121] hover:underline">
                            Log in here
                        </Link>
                    </p>
                </motion.div>

            </form>
        </motion.div>
    </div>
  );
};