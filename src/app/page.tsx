'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'; // Add this import
import SiteLogo from '@/components/SiteLogo'

export default function LoginPage() {
  const [login, setLogin] = useState('ateyjohn@gmail.com')
  const [password, setPassword] = useState('Deji0727*@')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login: loginUser } = useAuth(); // Use AuthContext
  const [homepageImages, setHomepageImages] = useState([
    '/images/rsz_1751870612148.jpg',
    '/images/rsz_holiday.jpg',
    '/images/rsz_1beach.jpg',
    '/images/rsz_1751870993363.jpg',
  ]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/site-settings');
        if (!res.ok) return;
        const settings = await res.json();
        const images = [1,2,3,4].map(i => {
          const found = settings.find((s:any) => s.key === `homepage_image_${i}`);
          return found && found.value ? found.value : homepageImages[i-1];
        });
        setHomepageImages(images);
      } catch {}
    }
    fetchSettings();
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    console.log('Main Page Login: Starting login process');
    try {
      await loginUser(login, password);
      console.log('Main Page Login: Login successful, waiting for context update');
      setTimeout(() => {
        // Debug: Check localStorage before redirect
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        console.log('Main Page Login: localStorage after login', { token, user });
        
        // Check user role and redirect accordingly
        if (user) {
          try {
            const userData = JSON.parse(user);
            console.log('Main Page Login: User data:', userData);
            console.log('Main Page Login: User role:', userData.role);
            console.log('Main Page Login: User role type:', typeof userData.role);
            
            if (userData.role === 'admin') {
              console.log('Main Page Login: Redirecting admin to admin panel');
              router.push("/admin");
            } else {
              console.log('Main Page Login: Redirecting trader to dashboard');
              router.push("/dashboard");
            }
          } catch (parseError) {
            console.error('Main Page Login: Error parsing user data:', parseError);
            console.error('Main Page Login: Raw user data:', user);
            router.push("/dashboard");
          }
        } else {
          console.log('Main Page Login: No user data, redirecting to dashboard');
          router.push("/dashboard");
        }
      }, 300);
    } catch (err: any) {
      console.error('Main Page Login: Login failed', err);
      if (err.response && err.response.message) {
        setError(err.response.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left side - Images Grid */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="grid grid-cols-2 gap-4 p-8 w-full">
          {/* Top Left */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500 to-yellow-600 p-6 flex items-center justify-center"
            style={{ backgroundImage: `url('${homepageImages[0]}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          {/* Top Right */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 p-6 flex items-center justify-center"
            style={{ backgroundImage: `url('${homepageImages[1]}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          {/* Bottom Left */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-green-600 to-blue-600 p-6 flex items-center justify-center"
            style={{ backgroundImage: `url('${homepageImages[2]}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          {/* Bottom Right */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-600 p-6 flex items-center justify-center"
            style={{ backgroundImage: `url('${homepageImages[3]}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="w-28 h-28 flex items-center justify-center mb-4">
                <SiteLogo className="w-28 h-28" fallbackText="FX" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">Welcome Back!</h2>
            <p className="text-gray-400 text-lg">
              Sign in with your email and password to access all that FXC-Hub has to offer. 
              Your journey begins now!
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Email Input */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="login"
                    name="login"
                    type="text"
                    required
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-4 pl-10 pr-3 border border-gray-600 placeholder-gray-400 text-white rounded-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent focus:bg-gray-800/70 transition-all duration-200"
                    placeholder="Email or Phone Number"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-4 pl-10 pr-12 border border-gray-600 placeholder-gray-400 text-white rounded-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent focus:bg-gray-800/70 transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Get Started'
                )}
              </button>
            </div>

            {/* Additional Links */}
            <div className="flex items-center justify-between">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Forgot your password?
              </Link>
              <Link
                href="/auth/register"
                className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                Create an account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
