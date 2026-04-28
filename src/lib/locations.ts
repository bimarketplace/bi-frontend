
const getApiUrl = () => '';

export interface State {
    id: number;
    name: string;
}

export interface LGA {
    id: number;
    state: number;
    name: string;
}

export const fetchStates = async (): Promise<State[]> => {
    try {
        const response = await fetch(`${getApiUrl()}/api/states/`, {
            next: { revalidate: 60 * 60 } // Cache for 1 hour
        });
        if (!response.ok) throw new Error('Failed to fetch states');
        const payload = await response.json();
        console.log('[API] States payload received:', Array.isArray(payload) ? payload.length : 'not an array');
        
        // Handle both bare arrays and paginated responses
        if (Array.isArray(payload)) return payload;
        if (payload && Array.isArray((payload as any).results)) return (payload as any).results;
        if (payload && Array.isArray((payload as any).data)) return (payload as any).data;
        
        return [];
    } catch (error) {
        console.error('Fetch States Error:', error);
        return [];
    }
};

export const fetchLGAs = async (stateId?: number): Promise<LGA[]> => {
    try {
        const url = stateId 
            ? `${getApiUrl()}/api/lgas/?state=${stateId}` 
            : `${getApiUrl()}/api/lgas/`;
        const response = await fetch(url, {
            next: { revalidate: 60 * 60 } // Cache for 1 hour
        });
        if (!response.ok) throw new Error('Failed to fetch LGAs');
        const payload = await response.json();

        if (Array.isArray(payload)) return payload;
        if (payload && Array.isArray((payload as any).results)) return (payload as any).results;
        if (payload && Array.isArray((payload as any).data)) return (payload as any).data;

        return [];
    } catch (error) {
        console.error('Fetch LGAs Error:', error);
        return [];
    }
};
