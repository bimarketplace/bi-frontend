import React from 'react';

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
    as?: React.ElementType;
}

export const Container = ({ 
    children, 
    className = "", 
    as: Component = "div" 
}: ContainerProps) => {
    return (
        <Component className={`max-w-screen-2xl mx-auto px-6 sm:px-12 ${className}`}>
            {children}
        </Component>
    );
};
