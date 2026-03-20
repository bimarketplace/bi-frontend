const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
    return response.json();
};
