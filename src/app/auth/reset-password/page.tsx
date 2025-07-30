"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "../../../lib/api";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');
    
    if (tokenParam) setToken(tokenParam);
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== passwordConfirmation) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      await api("/api/auth/reset-password", "POST", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <div className="bg-gray-900 rounded-2xl p-10 w-full max-w-md text-center">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Password Reset Successful!</h1>
          <p className="text-gray-400 mb-6">
            Your password has been successfully reset. You will be redirected to the login page shortly.
          </p>
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
            <p className="text-green-400">You can now log in with your new password.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="bg-gray-900 rounded-2xl p-10 w-full max-w-md">
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl font-bold">FX</span>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-center">Reset Password</h1>
        <p className="text-gray-400 mb-6 text-center">
          Enter your new password below.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 placeholder-gray-400 border border-gray-600 focus:border-yellow-500 focus:ring-yellow-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 placeholder-gray-400 border border-gray-600 focus:border-yellow-500 focus:ring-yellow-500"
              placeholder="Enter new password"
              required
              minLength={8}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 placeholder-gray-400 border border-gray-600 focus:border-yellow-500 focus:ring-yellow-500"
              placeholder="Confirm new password"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500 font-semibold hover:from-yellow-700 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/auth/login"
            className="text-yellow-400 hover:text-yellow-300 text-sm"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <div className="bg-gray-900 rounded-2xl p-10 w-full max-w-md text-center">
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl font-bold">FX</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Loading...</h1>
          <p className="text-gray-400">Please wait while we load the reset password form...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
} 