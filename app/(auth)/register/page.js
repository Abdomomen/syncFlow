'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSync } from '@/app/store/context';
import { useTokenSync } from '@/app/store/context';
import { useRouter } from 'next/navigation';
export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const setUser = useSync((s) => s.setUser);
  const setToken = useTokenSync((s) => s.setToken);

  const register = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const user = {
      username: name,
      email,
      password
    };

    try {
      const res = await fetch("api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.user);
        setToken(data.token);
        router.replace("dashboard");
      } else {
        setError(data.message || data.error || "Failed to create account. Please try again.");
      }
    } catch (err) {
      console.error("Register error:", err);
      setError("A network error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#09090b', color: '#fafafa', fontFamily: 'Inter, sans-serif' }}>
      {/* Left Side: Branding */}
      <aside className="hidden lg:flex flex-col justify-between w-1/2 p-12 border-r relative overflow-hidden"
        style={{ backgroundColor: '#0e0e10', borderColor: '#27272a' }}>
        <div className="absolute inset-0 z-0" style={{ opacity: 0.15 }}>
          <div className="absolute rounded-full" style={{ top: '-10%', right: '-10%', width: '500px', height: '500px', backgroundColor: '#8b5cf6', filter: 'blur(120px)' }}></div>
          <div className="absolute rounded-full" style={{ bottom: '-5%', left: '-5%', width: '400px', height: '400px', backgroundColor: '#d0bcff', filter: 'blur(100px)' }}></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf6' }}>
              <span className="material-symbols-outlined" style={{ color: '#fafafa', fontSize: '20px' }}>dashboard</span>
            </div>
            <h1 className="font-semibold text-2xl tracking-tight" style={{ color: '#fafafa' }}>TaskFlow</h1>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="font-semibold text-4xl mb-6 leading-tight" style={{ color: '#fafafa', letterSpacing: '-0.02em' }}>
            Start your enterprise journey today.
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: '#71717a' }}>
            Join thousands of high-performance teams using TaskFlow to manage tasks, subscriptions, and workflows at scale.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="relative z-10 space-y-4">
          {[
            { icon: 'check_circle', text: 'Unlimited tasks & projects' },
            { icon: 'check_circle', text: 'Real-time team collaboration' },
            { icon: 'check_circle', text: 'Advanced analytics & reporting' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <span className="material-symbols-outlined" style={{ color: '#8b5cf6', fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
              <span className="text-sm" style={{ color: '#e5e1e4' }}>{item.text}</span>
            </div>
          ))}
          <div className="flex gap-8 pt-4" style={{ color: '#71717a' }}>
            <span className="text-[11px] font-semibold tracking-[0.05em] uppercase" style={{ fontFamily: 'Geist, sans-serif' }}>EST. 2024</span>
            <span className="text-[11px] font-semibold tracking-[0.05em] uppercase" style={{ fontFamily: 'Geist, sans-serif' }}>VERSION 4.2.0</span>
            <span className="text-[11px] font-semibold tracking-[0.05em] uppercase" style={{ fontFamily: 'Geist, sans-serif' }}>ENTERPRISE SECURE</span>
          </div>
        </div>
      </aside>

      {/* Right Side: Register Form */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto" style={{ backgroundColor: '#09090b' }}>
        <div className="w-full max-w-[400px] space-y-8">
          {/* Mobile Header */}
          <div className="lg:hidden flex flex-col items-center mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#8b5cf6' }}>
              <span className="material-symbols-outlined text-3xl" style={{ color: '#fafafa' }}>dashboard</span>
            </div>
            <h1 className="font-semibold text-xl" style={{ color: '#fafafa' }}>TaskFlow</h1>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="font-semibold text-2xl" style={{ color: '#fafafa', letterSpacing: '-0.02em' }}>Create Account</h2>
            <p style={{ color: '#71717a' }}>Start your free trial. No credit card required.</p>
          </div>

          <form className="space-y-5" onSubmit={register}>
            {error && (
              <div 
                className="p-3 rounded-lg border text-sm flex gap-3 items-center animate-fadeIn" 
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.08)', 
                  borderColor: 'rgba(239, 68, 68, 0.2)', 
                  color: '#f87171' 
                }}
              >
                <span className="material-symbols-outlined text-lg" style={{ color: '#ef4444' }}>error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-xs font-medium" style={{ color: '#fafafa', fontFamily: 'Geist, sans-serif' }} htmlFor="fullname">
                Full Name
              </label>
              <input
                id="fullname"
                name="fullname"
                type="text"
                required
                placeholder="Alexander Thorne"
                className="w-full h-11 px-4 border rounded-lg transition-all text-sm"
                style={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fafafa' }}
                value={name}
                disabled={loading}
                onChange={(e)=> setName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-medium" style={{ color: '#fafafa', fontFamily: 'Geist, sans-serif' }} htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="name@organization.com"
                className="w-full h-11 px-4 border rounded-lg transition-all text-sm"
                style={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fafafa' }}
                value={email}
                disabled={loading}
                onChange={(e)=> setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-medium" style={{ color: '#fafafa', fontFamily: 'Geist, sans-serif' }} htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min. 8 characters"
                  className="w-full h-11 px-4 border rounded-lg transition-all text-sm"
                  style={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fafafa' }}
                  value={password}
                  disabled={loading}
                  onChange={(e)=> setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#71717a' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-xs font-medium" style={{ color: '#fafafa', fontFamily: 'Geist, sans-serif' }} htmlFor="confirm-password">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter your password"
                  className="w-full h-11 px-4 border rounded-lg transition-all text-sm"
                  style={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fafafa' }}
                  value={confirmPassword}
                  disabled={loading}
                  onChange={(e)=> setConfirmPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#71717a' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input type="checkbox" id="terms" required
                disabled={loading}
                className="mt-1 w-4 h-4 rounded"
                style={{ accentColor: '#8b5cf6', borderColor: '#27272a', backgroundColor: '#09090b' }} />
              <label htmlFor="terms" className="text-xs cursor-pointer" style={{ color: '#71717a' }}>
                I agree to the{' '}
                <a href="#" className="hover:underline" style={{ color: '#8b5cf6' }}>Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="hover:underline" style={{ color: '#8b5cf6' }}>Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-medium rounded-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] text-sm"
              style={{ 
                backgroundColor: loading ? '#5b3a9a' : '#8b5cf6', 
                color: '#ffffff',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                  Creating Account...
                </>
              ) : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" style={{ borderColor: '#27272a' }}></span>
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-widest px-4" style={{ color: '#71717a', backgroundColor: '#09090b' }}>
              Or sign up with
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="h-11 flex items-center justify-center gap-2 border bg-transparent rounded-lg transition-colors active:scale-[0.98] text-sm"
              style={{ borderColor: '#27272a', color: '#fafafa' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#1c1b1d'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </button>
            <button className="h-11 flex items-center justify-center gap-2 border bg-transparent rounded-lg transition-colors active:scale-[0.98] text-sm"
              style={{ borderColor: '#27272a', color: '#fafafa' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#1c1b1d'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          <p className="text-center text-sm" style={{ color: '#71717a' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-medium hover:underline underline-offset-4" style={{ color: '#8b5cf6' }}>
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
