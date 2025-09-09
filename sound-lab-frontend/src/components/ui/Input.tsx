import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web'; // Import for animation

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    // ✨ ANIMATION LOGIC: Define the spring for focus effects
    const animationProps = useSpring({
      // Creates a glowing effect that matches the theme color
      boxShadow: isFocused
        ? '0px 0px 0px 3px rgba(167, 139, 250, 0.3)'
        : '0px 0px 0px 0px rgba(167, 139, 250, 0)',
      borderColor: isFocused ? '#a78bfa' : '#4b5563', // purple-400 vs gray-600
      config: { tension: 300, friction: 20 },
    });

    // Forward the original onFocus/onBlur events if they exist
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };

    // ✨ THEME UPDATE: Themed styles for the input field
    const baseStyles =
      'flex h-10 w-full rounded-md border bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 transition-colors duration-200 ease-in-out focus:outline-none disabled:cursor-not-allowed disabled:opacity-50';

    const combinedClassName = `${baseStyles} ${className}`;

    return (
        <animated.input // ✨ Use the animated version of the input element
            type={type}
            className={combinedClassName}
            ref={ref}
            style={animationProps} // Apply animation styles
            onFocus={handleFocus}   // Trigger animation on focus
            onBlur={handleBlur}
            {...props}
        />
    );
  }
);

Input.displayName = 'Input';
