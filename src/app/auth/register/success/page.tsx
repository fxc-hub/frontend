"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RegistrationSuccessPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    // Get email from URL params or localStorage if available
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const handleBackToLogin = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-6">
        {/* Success Icon */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <svg 
            className="w-12 h-12 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">Account Created!</h1>
        <p className="text-gray-300 text-center mb-6">
          Welcome to FXCHub! Your account has been successfully created.
        </p>

        {/* Email Verification Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 rounded-full p-2 mr-3">
              <svg 
                className="w-5 h-5 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Check Your Email</h2>
          </div>
          
          <p className="text-gray-300 mb-4">
            We've sent a welcome email to:
          </p>
          
          {email && (
            <div className="bg-gray-700 rounded-lg p-3 mb-4">
              <p className="text-blue-400 font-medium text-center">{email}</p>
            </div>
          )}
          
          <p className="text-gray-300 text-sm">
            Please check your inbox (and spam folder) for a welcome message from FXCHub. 
            The email contains important information about your new account.
          </p>
        </div>

        {/* Next Steps */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-3">What's Next?</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start">
              <span className="bg-blue-500 rounded-full w-2 h-2 mt-2 mr-3 flex-shrink-0"></span>
              Check your email for the welcome message
            </li>
            <li className="flex items-start">
              <span className="bg-blue-500 rounded-full w-2 h-2 mt-2 mr-3 flex-shrink-0"></span>
              Log in to access your trading dashboard
            </li>
            <li className="flex items-start">
              <span className="bg-blue-500 rounded-full w-2 h-2 mt-2 mr-3 flex-shrink-0"></span>
              Explore our forex trading tools and features
            </li>
          </ul>
        </div>

        {/* Back to Login Button */}
        <button
          onClick={handleBackToLogin}
          className="w-full p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
        >
          Back to Login
        </button>

        {/* Support Info */}
        <p className="mt-4 text-center text-sm text-gray-400">
          Need help? Contact our support team at{" "}
          <a href="mailto:support@fxchub.com" className="text-blue-400 hover:underline">
            support@fxchub.com
          </a>
        </p>
      </div>
    </div>
  );
} 