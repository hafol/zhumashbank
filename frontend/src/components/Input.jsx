import React from 'react';
import clsx from 'clsx';

export function Input({ label, icon: Icon, error, ...props }) {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">{label}</label>}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-gray-400" />
                    </div>
                )}
                <input
                    className={clsx(
                        "w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none",
                        Icon ? "pl-11 pr-4" : "px-4"
                    )}
                    {...props}
                />
            </div>
            {error && <p className="mt-1 text-sm text-red-500 ml-1">{error}</p>}
        </div>
    );
}
