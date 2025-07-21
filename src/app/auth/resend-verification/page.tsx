'use client';

import { useState } from 'react';

export default function ResendVerificationPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + '/api/auth/resend-verification',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setError(data.message || 'Failed to send verification email.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4">Resend Verification Email</h1>
        {message && <p className="text-green-500 mb-4">{message}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 rounded-lg bg-gray-800 placeholder-gray-400 mb-4"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 font-semibold"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Resend Email'}
          </button>
        </form>
      </div>
    </div>
  );
}
