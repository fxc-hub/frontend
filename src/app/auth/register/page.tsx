"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("jane.smith@example.com");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("password");
  const [passwordConfirmation, setPasswordConfirmation] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await register(firstName.trim(), lastName.trim(), phone || null, email, password, passwordConfirmation);
      // Redirect to success page with email parameter
      router.push(`/auth/register/success?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      // Handle validation errors from backend
      if (err.response && err.response.errors) {
        const errors = err.response.errors;
        setError(Object.values(errors).flat().join(' '));
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-6">
        {/* Logo */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl font-bold">FX</span>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-gray-300 text-center mb-6 max-w-sm mx-auto">
          Join FXCHub today and start your trading journey!
        </p>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <input
              type="text"
              placeholder="First Name"
              className="p-3 rounded-lg bg-gray-800 placeholder-gray-400"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              className="p-3 rounded-lg bg-gray-800 placeholder-gray-400"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <input
            type="email"
            placeholder="jane.smith@example.com"
            className="w-full p-3 rounded-lg bg-gray-800 placeholder-gray-400 mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Phone Number (Optional)"
            className="w-full p-3 rounded-lg bg-gray-800 placeholder-gray-400 mb-4"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />



          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-gray-800 placeholder-gray-400 mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-3 rounded-lg bg-gray-800 placeholder-gray-400 mb-6"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 font-semibold"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <a href="/" className="text-blue-400 hover:underline">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
} 