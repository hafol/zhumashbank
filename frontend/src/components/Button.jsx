import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Button({ children, className, variant = 'primary', ...props }) {
    const variants = {
        primary: "bg-primary hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200",
        secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800",
        outline: "border-2 border-gray-200 hover:border-primary hover:text-primary text-gray-500",
        danger: "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-200 hover:opacity-90"
    };

    return (
        <button
            className={twMerge(clsx(
                "px-6 py-3 rounded-xl font-semibold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2",
                variants[variant],
                className
            ))}
            {...props}
        >
            {children}
        </button>
    );
}
