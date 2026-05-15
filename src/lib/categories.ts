const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bi-backend-1tf6.onrender.com';

export interface Category {
    id: number;
    name: string;
    image: string | null;
    image_url: string;
}

export const fetchCategories = async (): Promise<Category[]> => {
    const endpoint = `${API_URL}/api/categories/`;
    const maxRetries = 3;
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        try {
            const response = await fetch(endpoint, {
                next: { revalidate: 60 * 5 }, // Cache for 5 minutes
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch categories: ${response.status}`);
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
        } catch (err: any) {
            clearTimeout(timeoutId);
            lastError = err;
            const errorMessage = err.message || String(err);
            const errorCause = err.cause ? ` (Cause: ${err.cause})` : '';
            console.warn(`[Categories Fetch Attempt ${i + 1} Failed] ${errorMessage}${errorCause} for ${endpoint}`);
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1500 * (i + 1)));
            }
        }
    }

    console.error(`[Categories Fetch Exception] Final failure after ${maxRetries} attempts: ${lastError}`);
    return []; // Return empty array instead of throwing to prevent page crash
};
