import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ProductCreateData {
    name: string;
    price: string;
    description: string;
    product_type?: string;
    image?: File | null;
}

export const fetchProducts = async () => {
    const response = await fetch(`${API_URL}/api/products/`, {
        next: { revalidate: 60 } // Cache for 60 seconds
    });
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }
    return response.json();
};

export const createProduct = async (data: ProductCreateData, token: string) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('price', data.price);
    formData.append('description', data.description);
    if (data.product_type) formData.append('product_type', data.product_type);
    if (data.image) formData.append('image', data.image);

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

    const response = await axios.patch(`${API_URL}/api/products/${id}/`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const fetchProductById = async (id: number) => {
    const response = await axios.get(`${API_URL}/api/products/${id}/`);
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
