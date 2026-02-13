import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className }) {
    return (
        <div className={twMerge(clsx("bg-white rounded-2xl shadow-sm p-6 border border-gray-100", className))}>
            {children}
        </div>
    );
}
