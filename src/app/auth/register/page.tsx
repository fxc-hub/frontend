"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import SiteLogo from "@/components/SiteLogo";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("jane.smith@example.com");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [mobile, setMobile] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [postCode, setPostCode] = useState("");
  const [password, setPassword] = useState("password");
  const [passwordConfirmation, setPasswordConfirmation] = useState("password");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const router = useRouter();

  const validateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== passwordConfirmation) {
      setError("Passwords do not match");
      return;
    }

    if (!dateOfBirth) {
      setError("Date of birth is required");
      return;
    }

    const age = validateAge(dateOfBirth);
    if (age < 18) {
      setError("You must be at least 18 years old to register");
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the Terms and Conditions");
      return;
    }

    if (!privacyAccepted) {
      setError("You must accept the Privacy Policy");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await register(
        firstName.trim(), 
        lastName.trim(), 
        username.trim(),
        phone || null, 
        whatsapp || null,
        mobile || null,
        dateOfBirth,
        gender,
        address.trim(),
        country.trim(),
        city.trim(),
        postCode.trim(),
        email, 
        password, 
        passwordConfirmation,
        termsAccepted,
        privacyAccepted
      );
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
    <div className="min-h-screen flex items-center justify-center bg-black text-white py-8">
      <div className="w-full max-w-2xl p-6">
        {/* Logo */}
        <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <SiteLogo className="w-24 h-24" fallbackText="FX" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-gray-300 text-center mb-6 max-w-sm mx-auto">
          Join FXCHub today and start your trading journey!
        </p>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            type="text"
            placeholder="Username"
            className="w-full p-3 rounded-lg bg-gray-800 placeholder-gray-400"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 rounded-lg bg-gray-800 placeholder-gray-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="tel"
              placeholder="Phone Number"
              className="p-3 rounded-lg bg-gray-800 placeholder-gray-400"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="WhatsApp (Recommended)"
              className="p-3 rounded-lg bg-gray-800 placeholder-gray-400"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Mobile Number"
              className="p-3 rounded-lg bg-gray-800 placeholder-gray-400"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>

          {/* Date of Birth and Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="date"
              placeholder="Date of Birth"
              className="p-3 rounded-lg bg-gray-800 placeholder-gray-400"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
            <select
              className="p-3 rounded-lg bg-gray-800 placeholder-gray-400"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Address Information */}
          <textarea
            placeholder="Address"
            className="w-full p-3 rounded-lg bg-gray-800 placeholder-gray-400"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Country"
              className="p-3 rounded-lg bg-gray-800 placeholder-gray-400"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="City"
              className="p-3 rounded-lg bg-gray-800 placeholder-gray-400"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Post Code"
              className="p-3 rounded-lg bg-gray-800 placeholder-gray-400"
              value={postCode}
              onChange={(e) => setPostCode(e.target.value)}
              required
            />
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="password"
              placeholder="Password"
              className="p-3 rounded-lg bg-gray-800 placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="p-3 rounded-lg bg-gray-800 placeholder-gray-400"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />
          </div>

          {/* Terms and Privacy Policy */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1"
                required
              />
              <label htmlFor="terms" className="text-sm">
                I accept the{" "}
                <a href="/terms" className="text-yellow-400 hover:underline" target="_blank">
                  Terms and Conditions
                </a>
              </label>
            </div>
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="privacy"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-1"
                required
              />
              <label htmlFor="privacy" className="text-sm">
                I accept the{" "}
                <a href="/privacy" className="text-yellow-400 hover:underline" target="_blank">
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>

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
                          <a href="/" className="text-yellow-400 hover:underline">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
} 