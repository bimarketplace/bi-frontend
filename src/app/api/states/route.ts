import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bi-backend-1tf6.onrender.com';
        const endpoint = `${baseUrl}/api/states/`;
        console.log(`[API Proxy] Forwarding GET to: ${endpoint}`);
        
        let response: Response | null = null;
        let lastError: any = null;
        const maxRetries = 3;

        for (let i = 0; i < maxRetries; i++) {
            try {
                response = await fetch(endpoint, {
                    headers: { 'Accept': 'application/json' },
                    next: { revalidate: 3600 }
                });
                if (response.ok) break;
                console.warn(`[API Proxy] States attempt ${i+1} failed with status ${response.status}`);
            } catch (err) {
                lastError = err;
                console.warn(`[API Proxy] States attempt ${i+1} exception:`, err);
                if (i < maxRetries - 1) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
            }
        }

        if (!response || !response.ok) {
            return NextResponse.json([], { status: response?.status || 500 });
        }
        
        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        console.error('[API Proxy] States final error:', error);
        return NextResponse.json([], { status: 500 });
    }
}
