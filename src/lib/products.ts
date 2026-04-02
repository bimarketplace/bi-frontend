import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

export const fetchProductsPage = async (url?: string): Promise<PaginatedProductsResponse> => {
    const endpoint = url || `${API_URL}/api/products/`;
    const response = await fetch(endpoint, {
        next: { revalidate: 60 } // Cache for 60 seconds
    });
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }

    const payload = await response.json();

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

    const response = await axios.post(`${API_URL}/api/products/`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteProduct = async (id: number, token: string) => {
    const response = await axios.delete(`${API_URL}/api/products/${id}/`, {
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

    const response = await axios.patch(`${API_URL}/api/products/${id}/`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const fetchProductById = async (id: number, token?: string) => {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await axios.get(`${API_URL}/api/products/${id}/`, { headers });
    return response.data;
};

export const addComment = async (productId: number, text: string, token: string) => {
    const response = await axios.post(`${API_URL}/api/products/${productId}/comment/`, { text }, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return response.data;
};

export const castVote = async (productId: number, value: number, token: string) => {
    const response = await axios.post(`${API_URL}/api/products/${productId}/vote/`, { value }, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return response.data;
};

export const shareProduct = async (productId: number) => {
    const response = await axios.post(`${API_URL}/api/products/${productId}/share/`, {});
    return response.data;
};
