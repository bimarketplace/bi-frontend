import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const backendUrl = 'https://bi-backend-1tf6.onrender.com/auth/registration/';
        console.log(`[API Proxy] Forwarding registration to: ${backendUrl}`);
        
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        const data = await response.json().catch(() => ({}));
        
        if (!response.ok) {
            console.log(`[API Proxy] Backend returned error:`, response.status, data);
            return NextResponse.json(data, { status: response.status });
        }
        
        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error('[API Proxy] Internal error during registration proxying:', error);
        return NextResponse.json({ detail: 'Internal server error during proxying.' }, { status: 500 });
    }
}
