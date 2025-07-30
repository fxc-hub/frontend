"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function EmailVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  const handleBackToLogin = () => {
    router.push("/");
  };

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-6">
        {isSuccess ? (
          <>
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

            <h1 className="text-3xl font-bold text-center mb-2">Email Verified!</h1>
            <p className="text-gray-300 text-center mb-6">
              Your email address has been successfully verified. You can now log in to your account.
            </p>

            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-3">What's Next?</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start">
                  <span className="bg-green-500 rounded-full w-2 h-2 mt-2 mr-3 flex-shrink-0"></span>
                  Your email is now verified
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 rounded-full w-2 h-2 mt-2 mr-3 flex-shrink-0"></span>
                  Log in with your email or phone number
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 rounded-full w-2 h-2 mt-2 mr-3 flex-shrink-0"></span>
                  Access your trading dashboard
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            {/* Error Icon */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
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
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-center mb-2">Verification Failed</h1>
            <p className="text-gray-300 text-center mb-6">
              We were unable to verify your email address.
            </p>

            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-3">What to do:</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start">
                  <span className="bg-blue-500 rounded-full w-2 h-2 mt-2 mr-3 flex-shrink-0"></span>
                  Check if the verification link is still valid
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 rounded-full w-2 h-2 mt-2 mr-3 flex-shrink-0"></span>
                  Request a new verification email
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 rounded-full w-2 h-2 mt-2 mr-3 flex-shrink-0"></span>
                  Contact support if the problem persists
                </li>
              </ul>
            </div>
          </>
        )}

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

export default function EmailVerificationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <EmailVerificationContent />
    </Suspense>
  );
} 