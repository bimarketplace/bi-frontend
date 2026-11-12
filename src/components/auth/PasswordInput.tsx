"use client";

import { useState } from 'react';

interface PasswordInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    autoComplete: string;
    ariaLabel: string;
}

export default function PasswordInput({
    value,
    onChange,
    placeholder,
    autoComplete,
    ariaLabel,
}: PasswordInputProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative">
            <input
                type={isVisible ? 'text' : 'password'}
                required
                autoComplete={autoComplete}
                aria-label={ariaLabel}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="auth-input auth-input-password"
                placeholder={placeholder}
            />
            <button
                type="button"
                aria-label={isVisible ? 'Hide password' : 'Show password'}
                onClick={() => setIsVisible(!isVisible)}
                className="absolute inset-y-0 right-[4px] flex w-10 items-center justify-center text-[#aaa]"
            >
                {isVisible ? (
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                ) : (
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A9.8 9.8 0 0 1 12 5c6.4 0 10 7 10 7a14 14 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.4 0 2.6-.3 3.7-.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </button>
        </div>
    );
}
