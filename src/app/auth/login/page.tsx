"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";

export default function LoginPage() {
  const [login, setLogin] = useState("ateyjohn@gmail.com");
  const [password, setPassword] = useState("Deji0727*@");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: loginUser } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log('Login: Starting login process');
    try {
      await loginUser(login, password);
      console.log('Login: Login successful, waiting for context update');
      setTimeout(() => {
        // Debug: Check localStorage before redirect
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        console.log('Login: localStorage after login', { token, user });
        
        // Check user role and redirect accordingly
        if (user) {
          try {
            const userData = JSON.parse(user);
            console.log('Login: User data:', userData);
            console.log('Login: User role:', userData.role);
            console.log('Login: User role type:', typeof userData.role);
            
            if (userData.role === 'admin') {
              console.log('Login: Redirecting admin to admin panel');
              router.push("/admin");
            } else {
              console.log('Login: Redirecting trader to dashboard');
              router.push("/dashboard");
            }
          } catch (parseError) {
            console.error('Login: Error parsing user data:', parseError);
            console.error('Login: Raw user data:', user);
            router.push("/dashboard");
          }
        } else {
          console.log('Login: No user data, redirecting to dashboard');
          router.push("/dashboard");
        }
      }, 300);
    } catch (err: any) {
      console.error('Login: Login failed', err);
      if (err.response && err.response.message) {
        setError(err.response.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="grid md:grid-cols-2 w-full max-w-6xl p-6 gap-8">
        {/* Left side images */}
        <div className="hidden md:grid grid-cols-2 gap-4">
          <img src="/login/1.jpg" className="rounded-2xl object-cover" />
          <img src="/login/2.jpg" className="rounded-2xl object-cover" />
          <img src="/login/3.jpg" className="rounded-2xl object-cover" />
          <img src="/login/4.jpg" className="rounded-2xl object-cover" />
        </div>

        {/* Right side form */}
        <div className="flex flex-col items-center justify-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-24 h-24 flex items-center justify-center mb-8">
            <span className="text-3xl font-bold">FX</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-gray-300 mb-6 text-center max-w-sm">
            Sign in with your email and password to access all that FXCHub has
            to offer. Your journey begins now!
          </p>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form className="w-full max-w-sm" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Email or Phone Number"
              className="w-full p-3 rounded-lg mb-4 bg-gray-100 text-black"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mb-2 ml-1">You can use your registered email or phone number.</p>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-3 rounded-lg mb-6 bg-gray-100 text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 font-semibold"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Get Started"}
            </button>
          </form>

          <div className="flex justify-between w-full max-w-sm mt-4 text-sm">
            <a href="/auth/forgot-password" className="text-blue-400 hover:underline">
              Forgot your password?
            </a>
            <a href="/auth/register" className="text-blue-400 hover:underline">
              Create an account
            </a>
          </div>
          
          {/* Debug button - remove in production */}
          <button
            onClick={() => {
              localStorage.clear();
              console.log('Debug: Cleared all localStorage');
              window.location.reload();
            }}
            className="mt-4 text-xs text-gray-500 hover:text-red-400"
          >
            Clear localStorage (Debug)
          </button>
        </div>
      </div>
    </div>
  );
} 