"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { loginUser } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { AxiosError } from 'axios';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { FaGoogle } from 'react-icons/fa'; // Make sure you have react-icons installed

export const LoginForm = () => {
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
      let errorMessage = 'Login failed. Please check your credentials.';
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  // --- Animations ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050505] text-[#F3EFEA] relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg-img.png')" }}
    >
      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-0"></div>

      {/* Header / Logo */}
      <div className="absolute top-0 left-0 p-6 z-20">
        <Link href="/" className="flex items-center gap-3 group">
           <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-sm">♫</span>
           </div>
           <span className="text-xl font-black tracking-tighter text-white">SOUND LAB</span>
        </Link>
      </div>

      {/* Main Form Card */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md p-8 md:p-10 mx-4"
      >
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 md:p-12">
          
          <motion.div variants={itemVariants} className="text-center mb-10">
            <h2 className="text-4xl font-black text-white tracking-tight mb-2">
              Welcome Back
            </h2>
            <p className="text-neutral-400">
              Sign in to access your collaborative rooms
            </p>
          </motion.div>

          {/* Google Login Button */}
          <motion.div variants={itemVariants} className="mb-8">
            <Button 
              onClick={handleGoogleLogin}
              className="w-full bg-black text-gray-900 hover:bg-gray-200 font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-transform hover:scale-[1.02]"
            >
              <FaGoogle className="text-red-600 text-lg" />
              <span>Continue with Google</span>
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0a0a0a] px-3 text-neutral-500 rounded-full border border-white/5">
                Or continue with email
              </span>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={itemVariants}>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                disabled={isLoading}
                className="bg-black/40 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 transition-all w-full"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={isLoading}
                className="bg-black/40 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 transition-all w-full"
              />
            </motion.div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center"
              >
                {error}
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
                className="h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all"
              >
                {isLoading ? <Spinner size="sm" /> : 'Log In'}
              </Button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="mt-8 text-center">
            <p className="text-neutral-400 text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-white font-bold hover:text-purple-400 transition-colors underline decoration-white/20 hover:decoration-purple-400">
                Sign up here
              </Link>
            </p>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
};