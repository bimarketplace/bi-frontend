import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const googleAuth = async (accessToken: string, code?: string) => {
    try {
        const response = await axios.post(`${API_URL}/google/`, {
            access_token: accessToken,
            code: code
        });
        return response.data;
    } catch (error) {
        console.error('Google Auth Error:', error);
        throw error;
    }
};
export const register = async (userData: any) => {
    try {
        const response = await axios.post(`${API_URL}/auth/registration/`, userData);
        return response.data;
    } catch (error) {
        console.error('Registration Error:', error);
        throw error;
    }
};

export const resendEmail = async (email: string) => {
    try {
        const response = await axios.post(`${API_URL}/auth/registration/resend-email/`, { email });
        return response.data;
    } catch (error) {
        console.error('Resend Email Error:', error);
        throw error;
    }
};

export const verifyEmail = async (key: string) => {
    try {
        const response = await axios.post(`${API_URL}/auth/registration/verify-email/`, { key });
        return response.data;
    } catch (error) {
        console.error('Verify Email Error:', error);
        throw error;
    }
};

export const fetchUserProfile = async (token: string) => {
    try {
        const response = await axios.get(`${API_URL}/auth/user/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Fetch Profile Error:', error);
        throw error;
    }
};

export const updateProfile = async (userData: any, token: string) => {
    try {
        const response = await axios.patch(`${API_URL}/auth/user/`, userData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Update Profile Error:', error);
        throw error;
    }
};
