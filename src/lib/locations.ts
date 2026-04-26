import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
        const response = await axios.get(`${API_URL}/api/states/`);
        const payload = response.data;
        
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
            ? `${API_URL}/api/lgas/?state=${stateId}` 
            : `${API_URL}/api/lgas/`;
        const response = await axios.get(url);
        const payload = response.data;

        if (Array.isArray(payload)) return payload;
        if (payload && Array.isArray((payload as any).results)) return (payload as any).results;
        if (payload && Array.isArray((payload as any).data)) return (payload as any).data;

        return [];
    } catch (error) {
        console.error('Fetch LGAs Error:', error);
        return [];
    }
};
