import axios from 'axios';

const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'https://bi-backend-1tf6.onrender.com';

export interface User {
    id: number;
    username: string;
    avatar_url?: string;
    email?: string;
}

export interface ProductSummary {
    id: number;
    name: string;
    image_url?: string;
}

export interface Message {
    id: number;
    sender: User;
    body: string;
    is_read: boolean;
    created_at: string;
}

export interface Conversation {
    id: number;
    participants: User[];
    product?: ProductSummary;
    last_message?: Message;
    unread_count: number;
    updated_at: string;
}

export const fetchConversations = async (token: string): Promise<Conversation[]> => {
    const response = await axios.get(`${getApiUrl()}/api/conversations/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    // Can be paginated depending on backend, let's assume it returns array or paginated response
    if (response.data.results) {
        return response.data.results;
    }
    return response.data;
};

export const fetchConversation = async (id: number, token: string): Promise<Conversation> => {
    const response = await axios.get(`${getApiUrl()}/api/conversations/${id}/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

export const fetchMessages = async (conversationId: number, token: string): Promise<Message[]> => {
    const response = await axios.get(`${getApiUrl()}/api/conversations/${conversationId}/messages/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (response.data.results) {
        return response.data.results;
    }
    return response.data;
};

export const startConversation = async (sellerId: number, productId: number | null, token: string): Promise<Conversation> => {
    const data: any = { seller_id: sellerId };
    if (productId) {
        data.product_id = productId;
    }

    const response = await axios.post(`${getApiUrl()}/api/conversations/start/`, data, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

export const getWebSocketUrl = (conversationId: number, token?: string) => {
    const apiUrl = getApiUrl();
    let wsBase = apiUrl.replace(/^http/, 'ws');
    
    // ensure trailing slash
    if (!wsBase.endsWith('/')) {
        wsBase += '/';
    }
    
    if (token) {
        return `${wsBase}ws/chat/${conversationId}/?token=${token}`;
    }
    return `${wsBase}ws/chat/${conversationId}/`;
};
