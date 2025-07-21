export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function api<T = any>(
  endpoint: string,
  method: string = 'GET',
  body?: Record<string, any>,
  token?: string
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const errorMessage = data.message || data.error || 'Request failed';
    const error = new Error(errorMessage);
    (error as any).response = data;
    throw error;
  }
  return res.json() as Promise<T>;
} 