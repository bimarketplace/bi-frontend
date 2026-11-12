import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    titleAlignment?: 'left' | 'center';
}

export default function AuthLayout({
    children,
    title,
    subtitle,
    titleAlignment = 'center',
}: AuthLayoutProps) {
    return (
        <div
            className="fixed inset-0 z-[100] overflow-y-auto bg-white text-[#171717]"
            style={{
                paddingTop: 'max(calc(env(safe-area-inset-top) + 10px), 62px)',
                paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
            }}
        >
            <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col px-[20px]">
                <header className={titleAlignment === 'left' ? 'pl-[9px] text-left' : 'text-center'}>
                    <h1 className="text-[18px] font-medium leading-[23px] text-[#111]">{title}</h1>
                    {subtitle && (
                        <p className="mt-2 text-[10px] leading-[14px] text-[#999]">{subtitle}</p>
                    )}
                </header>
                <div className="mt-[24px] flex min-h-0 flex-1 flex-col">
                    {children}
                </div>
            </div>
        </div>
    );
}
