"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signupUser } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { AxiosError } from 'axios';
import { motion, Variants } from 'framer-motion';

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
      router.push('/login');
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
  
  // --- Framer Motion Animation Variants ---

  // Container animation for the main form
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.12,
      },
    },
  };

  // Animation for individual form elements
  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Flame flicker animation for background elements
  const flameVariants: Variants = {
    animate: {
      opacity: [0.3, 0.7, 0.5, 0.9],
      scale: [1, 1.08, 0.96, 1.02],
      rotate: [0, 3, -2, 1],
      transition: {
        duration: 5,
        repeat: 1,
        repeatType: "reverse",
        ease: "easeIn",
      },
    },
  };

  // Button hover animation
  const buttonVariants: Variants = {
    hover: { 
      scale: 1.02,
      boxShadow: "0 12px 35px rgba(255, 165, 0, 0.35)",
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 },
  };

  // Success animation for form completion
  const successVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "backOut",
      },
    },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-red-900/20 to-orange-900/30 p-4 font-sans relative overflow-hidden">
      
      {/* Animated Flame Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          variants={flameVariants}
          animate="animate"
          className="absolute top-[15%] left-[8%] w-72 h-72 bg-gradient-to-r from-red-500/12 to-orange-500/18 rounded-full blur-3xl"
          style={{ animationDelay: "0s" }}
        />
        <motion.div
          variants={flameVariants}
          animate="animate"
          className="absolute bottom-[18%] right-[12%] w-88 h-88 bg-gradient-to-r from-yellow-500/10 to-red-500/15 rounded-full blur-3xl"
          style={{ animationDelay: "2.5s" }}
        />
        <motion.div
          variants={flameVariants}
          animate="animate"
          className="absolute top-[55%] left-[75%] w-56 h-56 bg-gradient-to-r from-orange-500/14 to-yellow-500/12 rounded-full blur-3xl"
          style={{ animationDelay: "1.2s" }}
        />
        <motion.div
          variants={flameVariants}
          animate="animate"
          className="absolute top-[35%] left-[25%] w-40 h-40 bg-gradient-to-r from-red-400/8 to-orange-400/10 rounded-full blur-3xl"
          style={{ animationDelay: "3.8s" }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md p-8 space-y-6 bg-black/40 rounded-2xl shadow-2xl backdrop-blur-lg border border-orange-500/20"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title */}
          <motion.div variants={itemVariants}>
            <motion.h2 
              animate={{
                textShadow: [
                  "0 0 20px rgba(255, 165, 0, 0.3)",
                  "0 0 30px rgba(255, 140, 0, 0.4)",
                  "0 0 25px rgba(255, 165, 0, 0.35)",
                ],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="text-3xl font-bold text-center bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent"
            >
              Create an Account
            </motion.h2>
          </motion.div>

          {/* Subtitle */}
          <motion.div variants={itemVariants}>
            <p className="text-center text-orange-200/80 text-sm -mt-4">
              Join our community today.
            </p>
          </motion.div>

          {/* Username Field */}
          <motion.div variants={itemVariants}>
            <label htmlFor="username" className="block text-sm font-medium text-orange-200 mb-1">
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="your_username"
              disabled={isLoading}
              className="mt-1 bg-black/30 border-orange-500/30 text-white placeholder-orange-200/50 focus:ring-orange-400 focus:border-orange-400 focus:shadow-orange-500/20 focus:shadow-lg rounded-lg transition-all duration-300"
            />
          </motion.div>

          {/* Email Field */}
          <motion.div variants={itemVariants}>
            <label htmlFor="email" className="block text-sm font-medium text-orange-200 mb-1">
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
              className="mt-1 bg-black/30 border-orange-500/30 text-white placeholder-orange-200/50 focus:ring-orange-400 focus:border-orange-400 focus:shadow-orange-500/20 focus:shadow-lg rounded-lg transition-all duration-300"
            />
          </motion.div>

          {/* Password Field */}
          <motion.div variants={itemVariants}>
            <label htmlFor="password" className="block text-sm font-medium text-orange-200 mb-1">
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
              className="mt-1 bg-black/30 border-orange-500/30 text-white placeholder-orange-200/50 focus:ring-orange-400 focus:border-orange-400 focus:shadow-orange-500/20 focus:shadow-lg rounded-lg transition-all duration-300"
            />
          </motion.div>

          {/* Password Requirements */}
          <motion.div variants={itemVariants}>
            <div className="text-xs text-orange-200/60 bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
              <p className="font-medium mb-1 text-orange-300">Password should contain:</p>
              <ul className="space-y-0.5 ml-2">
                <li>• At least 8 characters</li>
                <li>• One uppercase letter</li>
                <li>• One number or special character</li>
              </ul>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <p className="text-sm font-medium text-red-400 text-center bg-red-500/10 p-3 rounded-lg backdrop-blur-sm border border-red-500/20">
                {error}
              </p>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div variants={itemVariants}>
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
                className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-300 hover:via-orange-400 hover:to-red-400 text-white font-bold transition-all duration-300 ease-in-out shadow-lg hover:shadow-orange-500/30"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Spinner size="sm" />
                  </motion.div>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </motion.div>
          </motion.div>

          {/* Additional Links Section */}
          <motion.div variants={itemVariants} className="text-center space-y-2">
            <motion.p 
              className="text-sm text-orange-200/60"
              whileHover={{ color: "rgb(255, 213, 128)" }}
              transition={{ duration: 0.2 }}
            >
              Already have an account?{' '}
              <motion.span
                className="text-orange-400 hover:text-orange-300 cursor-pointer underline"
                whileHover={{ scale: 1.05 }}
                onClick={() => router.push('/login')}
              >
                Log in here
              </motion.span>
            </motion.p>
            <motion.p 
              className="text-xs text-orange-200/40 hover:text-orange-200/60 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
            >
              By signing up, you agree to our Terms of Service
            </motion.p>
          </motion.div>

          {/* Success State Animation */}
          {!error && isLoading && (
            <motion.div
              variants={successVariants}
              initial="hidden"
              animate="visible"
              className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl backdrop-blur-sm"
            >
              <div className="text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 180, 360] 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                  className="text-6xl mb-4"
                >
                  🔥
                </motion.div>
                <p className="text-orange-300 font-medium">Creating your account...</p>
              </div>
            </motion.div>
          )}
        </form>
      </motion.div>
    </div>
  );
};