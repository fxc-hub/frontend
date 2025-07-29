"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../lib/api";

interface ProfileFormData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  whatsapp: string;
  mobile: string;
  date_of_birth: string;
  gender: string;
  address: string;
  country: string;
  city: string;
  post_code: string;
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    whatsapp: "",
    mobile: "",
    date_of_birth: "",
    gender: "",
    address: "",
    country: "",
    city: "",
    post_code: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        whatsapp: user.whatsapp || "",
        mobile: user.mobile || "",
        date_of_birth: user.date_of_birth || "",
        gender: user.gender || "",
        address: user.address || "",
        country: user.country || "",
        city: user.city || "",
        post_code: user.post_code || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await api('/api/user/profile', 'PUT', formData);
      await refreshUser();
      setMessage({ type: 'success', text: response.message || 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Profile Settings</h1>
          <p className="text-gray-300">Manage your account information and preferences</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">WhatsApp</label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mobile Number</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Address Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Post Code</label>
                  <input
                    type="text"
                    name="post_code"
                    value={formData.post_code}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <input
                  type="text"
                  value={user.role}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-300"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Member Since</label>
                <input
                  type="text"
                  value={user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-300"
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
                              className="px-6 py-3 rounded-lg bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 