const API_URL = 'https://bi-backend-1tf6.onrender.com';

export interface Category {
    id: number;
    name: string;
    image: string | null;
    image_url: string;
}

export const fetchCategories = async (): Promise<Category[]> => {
    const response = await fetch(`${API_URL}/api/categories/`, {
        next: { revalidate: 60 * 5 } // Cache for 5 minutes
    });
    if (!response.ok) {
        throw new Error('Failed to fetch categories');
    }

    const payload = await response.json();

    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray((payload as any).categories)) {
        return (payload as any).categories;
    }

    if (Array.isArray((payload as any).results)) {
        return (payload as any).results;
    }

    if (Array.isArray((payload as any).data)) {
        return (payload as any).data;
    }

    console.warn('Unexpected categories payload format:', payload);
    return [];
};
