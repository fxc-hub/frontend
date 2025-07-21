"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      await refreshUser();
    } catch (err: any) {
      setError("Failed to refresh user profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div>Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-gray-900 rounded-xl p-8 w-full max-w-md shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>
        <div className="space-y-4">
          <div>
            <div className="text-gray-400 text-sm">Full Name</div>
            <div className="text-white text-lg font-semibold">{user.first_name} {user.last_name}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Email</div>
            <div className="text-white">{user.email}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Phone</div>
            <div className="text-white">{user.phone || "Not provided"}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Role</div>
            <div className="text-white capitalize">{user.role}</div>
          </div>
        </div>
        {error && <div className="text-red-400 mt-4">{error}</div>}
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          {loading ? "Refreshing..." : "Refresh Profile"}
        </button>
      </div>
    </div>
  );
} 