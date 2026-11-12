import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bi-backend-1tf6.onrender.com';

export const getAuthErrorMessage = (error: unknown, fallback: string): string => {
    if (!axios.isAxiosError(error)) return fallback;

    const data: unknown = error.response?.data;
    if (typeof data === 'string') return data;
    if (typeof data !== 'object' || data === null || Array.isArray(data)) return fallback;

    const entries = Object.entries(data as Record<string, unknown>);
    const detail = entries.find(([field]) => field === 'detail')?.[1];
    if (typeof detail === 'string') return detail;

    const messages = entries.flatMap(([field, value]) => {
        const values = Array.isArray(value) ? value : [value];
        return values
            .filter((message): message is string => typeof message === 'string')
            .map((message) => `${field}: ${message}`);
    });

    return messages.join(' | ') || fallback;
};

export const googleAuth = async (accessToken: string, code?: string) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/google/`, {
            access_token: accessToken,
            code: code
        });
        return response.data;
    } catch (error: unknown) {
        console.error('Google Auth Error:', error);
        throw error;
    }
};

export interface RegistrationData {
    username: string;
    email: string;
    password1: string;
    password2: string;
}

export const register = async (userData: RegistrationData) => {
    try {
        console.log('[DEBUG] Registering via local proxy...');
        // We use the local Next.js API route to bypass CORS issues securely.
        const response = await axios.post('/api/register', userData);
        return response.data;
    } catch (error: unknown) {
        console.error('Registration Error:', error);
        throw error;
    }
};

export const resendEmail = async (email: string) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/auth/registration/resend-email/`, { email });
        return response.data;
    } catch (error: unknown) {
        console.error('Resend Email Error:', error);
        throw error;
    }
};

export const verifyEmail = async (key: string) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/auth/registration/verify-email/`, { key });
        return response.data;
    } catch (error: unknown) {
        console.error('Verify Email Error:', error);
        throw error;
    }
};

export const requestPasswordReset = async (email: string) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/auth/password/reset/`, { email });
        return response.data;
    } catch (error: unknown) {
        console.error('Password Reset Request Error:', error);
        throw error;
    }
};

export const confirmPasswordReset = async (data: {
    uid: string;
    token: string;
    new_password1: string;
    new_password2: string;
}) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/auth/password/reset/confirm/`, data);
        return response.data;
    } catch (error: unknown) {
        console.error('Password Reset Confirmation Error:', error);
        throw error;
    }
};

export const fetchUserProfile = async (token: string) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/auth/user/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: unknown) {
        console.error('Fetch Profile Error:', error);
        throw error;
    }
};

export const updateProfile = async (userData: any, token: string) => {
    try {
        const response = await axios.patch(`${BACKEND_URL}/auth/user/`, userData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: unknown) {
        console.error('Update Profile Error:', error);
        throw error;
    }
};
