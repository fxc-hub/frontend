"use client";

import { useState } from "react";
import { api } from "../../../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api("/api/auth/forgot-password", "POST", { email });
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="bg-gray-900 rounded-2xl p-10 w-full max-w-md text-center">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl font-bold">FX</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
        <p className="text-gray-400 mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {sent ? (
          <p className="text-green-500">Reset link sent! Check your email.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="you@email.com"
              className="w-full p-3 rounded-lg bg-gray-800 placeholder-gray-400 mb-6"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 font-semibold"
            >
              Send Reset Link
            </button>
          </form>
        )}

        <a href="/" className="inline-block mt-6 text-blue-400 hover:underline">
          Back to Login
        </a>
      </div>
    </div>
  );
} 