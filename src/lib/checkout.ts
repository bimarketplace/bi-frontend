const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bi-backend-1tf6.onrender.com/api';

export interface CheckoutData {
  full_name: string;
  address: string;
  phone: string;
  notes?: string;
  items_json: any[];
  total_price: number;
}

export const submitCheckout = async (data: CheckoutData) => {
  try {
    const response = await fetch(`${API_URL}/checkouts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to submit checkout to backend');
    }

    return await response.json();
  } catch (error) {
    console.error('Checkout submission error:', error);
    // We don't throw here to avoid blocking the WhatsApp flow if the backend is down
    return null;
  }
};
