import axios from 'axios';

const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'https://bi-backend-1tf6.onrender.com';

export interface Product {
    id: number;
    seller: {
        id: number;
        username: string;
        email?: string;
        whatsapp_number?: string;
        bio?: string;
        avatar?: string | null;
        avatar_url?: string | null;
        first_name?: string;
        last_name?: string;
        state_details?: { id: number; name: string };
        lga_details?: { id: number; name: string };
    };
    name: string;
    price: string;
    description: string;
    product_type?: string;
    category?: {
        id: number;
        name: string;
    } | null;
    image_url?: string;
    vote_score?: number;
    share_count?: number;
    comments?: any[];
    whatsapp_link?: string;
}

export interface PaginatedProductsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Product[];
}

export interface ProductCreateData {
    name: string;
    price: string;
    description: string;
    product_type?: string;
    image?: File | null;
    category?: string | number | null;
}

export const fetchProductsPage = async (url?: string, params?: Record<string, string | number>): Promise<PaginatedProductsResponse> => {
    let endpoint = url;
    
    if (!endpoint) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, value.toString());
                }
            });
        }
        const queryString = searchParams.toString();
        endpoint = `${getApiUrl()}/api/products/${queryString ? `?${queryString}` : ''}`;
    }

    console.log(`[Fetch] Fetching from: ${endpoint}`);

    const maxRetries = 10;
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        try {
            const response = await fetch(endpoint, {
                next: { revalidate: 0 },
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                console.error(`[Fetch Error] Status: ${response.status} for ${endpoint}`);
                throw new Error(`Failed to fetch products: ${response.status}`);
            }
            
            const payload = await response.json();
            return processPayload(payload);
        } catch (err: any) {
            clearTimeout(timeoutId);
            lastError = err;
            const errorMessage = err.message || String(err);
            const errorCause = err.cause ? ` (Cause: ${err.cause})` : '';
            console.warn(`[Fetch Attempt ${i + 1} Failed] ${errorMessage}${errorCause} for ${endpoint}. Retrying...`);
            
            // If it's the last attempt, don't wait, just throw
            if (i < maxRetries - 1) {
                // Wait for a duration before retrying - generous delay for cold starts
                const delay = Math.min(2000 * (i + 1), 10000); // Max 10s delay
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    console.error(`[Fetch Exception] Final failure after ${maxRetries} attempts: ${lastError} for ${endpoint}`);
    return {
        count: 0,
        next: null,
        previous: null,
        results: [],
    };
};

// Extracted payload processing to keep fetchProductsPage clean
const processPayload = (payload: any): PaginatedProductsResponse => {

    if (Array.isArray(payload)) {
        return {
            count: payload.length,
            next: null,
            previous: null,
            results: payload,
        };
    }

    if (Array.isArray((payload as any).results)) {
        return {
            count: (payload as any).count ?? (payload as any).results.length,
            next: (payload as any).next ?? null,
            previous: (payload as any).previous ?? null,
            results: (payload as any).results,
        };
    }

    if (Array.isArray((payload as any).data)) {
        return {
            count: (payload as any).count ?? (payload as any).data.length,
            next: (payload as any).next ?? null,
            previous: (payload as any).previous ?? null,
            results: (payload as any).data,
        };
    }

    if (Array.isArray((payload as any).products)) {
        return {
            count: (payload as any).count ?? (payload as any).products.length,
            next: (payload as any).next ?? null,
            previous: (payload as any).previous ?? null,
            results: (payload as any).products,
        };
    }

    console.warn('Unexpected products payload format:', payload);
    return {
        count: 0,
        next: null,
        previous: null,
        results: [],
    };
};

export const fetchProducts = async (): Promise<Product[]> => {
    const page = await fetchProductsPage();
    return page.results;
};

export const createProduct = async (data: ProductCreateData, token: string) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('price', data.price);
    formData.append('description', data.description);
    if (data.product_type) formData.append('product_type', data.product_type);
    if (data.image) formData.append('image', data.image);
    if (data.category) formData.append('category', data.category.toString());

    const response = await axios.post(`${getApiUrl()}/api/products/`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteProduct = async (id: number, token: string) => {
    const response = await axios.delete(`${getApiUrl()}/api/products/${id}/`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return response.data;
};

export const updateProduct = async (id: number, data: Partial<ProductCreateData>, token: string) => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.price) formData.append('price', data.price);
    if (data.description) formData.append('description', data.description);
    if (data.product_type) formData.append('product_type', data.product_type);
    if (data.image) formData.append('image', data.image);
    if (data.category) formData.append('category', data.category.toString());

    const response = await axios.patch(`${getApiUrl()}/api/products/${id}/`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const fetchProductById = async (id: number, token?: string) => {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await axios.get(`${getApiUrl()}/api/products/${id}/`, { headers });
    return response.data;
};

export const addComment = async (productId: number, text: string, token: string) => {
    const response = await axios.post(`${getApiUrl()}/api/products/${productId}/comment/`, { text }, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return response.data;
};

export const castVote = async (productId: number, value: number, token: string) => {
    const response = await axios.post(`${getApiUrl()}/api/products/${productId}/vote/`, { value }, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return response.data;
};

export const shareProduct = async (productId: number) => {
    const response = await axios.post(`${getApiUrl()}/api/products/${productId}/share/`, {});
    return response.data;
};
