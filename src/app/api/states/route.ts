import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const backendUrl = 'https://bi-backend-1tf6.onrender.com/api/states/';
        console.log(`[API Proxy] Forwarding GET to: ${backendUrl}`);
        
        const response = await fetch(backendUrl, {
            headers: {
                'Accept': 'application/json'
            },
            next: { revalidate: 3600 }
        });
        
        const data = await response.json().catch(() => ([]));
        
        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }
        
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        console.error('[API Proxy] States fetch error:', error);
        return NextResponse.json([], { status: 500 });
    }
}
