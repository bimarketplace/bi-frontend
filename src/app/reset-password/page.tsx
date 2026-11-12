import ResetPasswordClient from './ResetPasswordClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Reset Password | BI Marketplace',
    description: 'Choose a new password for your BI Marketplace account.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function ResetPasswordPage() {
    return <ResetPasswordClient />;
}
