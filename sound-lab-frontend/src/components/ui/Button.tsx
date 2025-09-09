import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

// Define the props for the Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; 
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', fullWidth = false, className = '', ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);


    const animationProps = useSpring({
      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      boxShadow: isHovered
        ? '0px 10px 20px -5px rgba(0, 0, 0, 0.2)'
        : '0px 5px 15px -5px rgba(0, 0, 0, 0.1)',
      config: { tension: 300, friction: 15 },
    });

    // Base styles for all buttons
    const baseStyles =
      'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    // Styles specific to each variant
    const variantStyles = {
      primary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
      secondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost: 'bg-transparent text-purple-400 hover:bg-purple-500/20 focus:ring-purple-500',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${widthStyle} ${className}`;

    return (
      <animated.button // ✨ Use the animated version of the button element
        ref={ref}
        className={combinedClassName}
        style={animationProps} // Apply the animation styles
        onMouseEnter={() => setIsHovered(true)} // Trigger animation on hover
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {children}
      </animated.button>
    );
  }
);

Button.displayName = 'Button';
