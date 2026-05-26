const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bi-backend-1tf6.onrender.com';

export interface LogisticsCompany {
    id: number;
    name: string;
    description: string;
    contact_person?: string;
    contact_email?: string;
    contact_phone?: string;
    website?: string;
    pickup_address?: string;
    coverage_area?: string;
    service_types?: string;
    delivery_options?: string;
    pricing_notes?: string;
    estimated_delivery_time?: string;
    tracking_available?: boolean;
    is_active?: boolean;
    created_by?: {
        id?: number;
        username?: string;
        avatar_url?: string | null;
    };
    created_at?: string;
    updated_at?: string;
}

const normalizeLogisticsPayload = (payload: any): LogisticsCompany[] => {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload.results)) {
        return payload.results;
    }

    if (Array.isArray(payload.data)) {
        return payload.data;
    }

    if (Array.isArray(payload.logistics)) {
        return payload.logistics;
    }

    return [];
};

export const fetchLogistics = async (): Promise<LogisticsCompany[]> => {
    const endpoint = `${API_URL}/api/logistics/`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(endpoint, {
            next: { revalidate: 60 },
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Failed to fetch logistics: ${response.status}`);
        }

        const payload = await response.json();
        return normalizeLogisticsPayload(payload);
    } catch (error) {
        clearTimeout(timeoutId);
        console.error("Logistics fetch error:", error);
        return [];
    }
};

export const fetchLogisticsById = async (id: number): Promise<LogisticsCompany> => {
    const endpoint = `${API_URL}/api/logistics/${id}/`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(endpoint, {
            next: { revalidate: 60 },
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Failed to fetch logistics company: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        console.error("Logistics detail fetch error:", error);
        throw error;
    }
};
