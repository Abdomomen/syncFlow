'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSync } from '@/app/store/context';
import { useTokenSync } from '@/app/store/context';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  
  // تصحيح الـ Hooks (إما تمرير الـ selector كامل أو استدعاء بدون selector حسب مكتبتك)
  const setToken = useTokenSync((s) => s.setToken);
  const setUser = useSync((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const user = { email, password };
    
    try {
      const res = await fetch("api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user)
      });
      
      const data = await res.json();
      
      if (res.ok) { 
        setToken(data.token);
        setUser(data.user);
        router.push('/dashboard'); 
      } else {
        setError(data.message || data.error || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
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
            Engineered for precision performance.
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: '#71717a' }}>
            Experience the enterprise tier of task management. Minimalist utility combined with advanced synchronization for high-performance teams.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col gap-6">
            <div className="p-6 border rounded-xl" style={{ borderColor: '#27272a', backgroundColor: '#1c1b1d' }}>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full border flex items-center justify-center" style={{ borderColor: '#27272a', backgroundColor: '#09090b' }}>
                  <span className="material-symbols-outlined" style={{ color: '#8b5cf6', fontSize: '20px' }}>auto_awesome</span>
                </div>
                <div>
                  <p className="font-medium mb-1" style={{ color: '#fafafa' }}>Automated Workflows</p>
                  <p className="text-sm" style={{ color: '#71717a' }}>Let our intelligent engine handle the mundane so you can focus on shipping.</p>
                </div>
              </div>
            </div>
            <div className="flex gap-8" style={{ color: '#71717a' }}>
              <span className="text-[11px] font-semibold tracking-[0.05em] uppercase" style={{ fontFamily: 'Geist, sans-serif' }}>EST. 2024</span>
              <span className="text-[11px] font-semibold tracking-[0.05em] uppercase" style={{ fontFamily: 'Geist, sans-serif' }}>VERSION 4.2.0</span>
              <span className="text-[11px] font-semibold tracking-[0.05em] uppercase" style={{ fontFamily: 'Geist, sans-serif' }}>ENTERPRISE SECURE</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Side: Auth Form */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12" style={{ backgroundColor: '#09090b' }}>
        <div className="w-full max-w-[400px] space-y-8">
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#8b5cf6' }}>
              <span className="material-symbols-outlined text-3xl" style={{ color: '#fafafa' }}>dashboard</span>
            </div>
            <h1 className="font-semibold text-xl" style={{ color: '#fafafa' }}>TaskFlow</h1>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="font-semibold text-2xl" style={{ color: '#fafafa', letterSpacing: '-0.02em' }}>Sign In</h2>
            <p style={{ color: '#71717a' }}>Enter your credentials to access your dashboard</p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={login}>
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

            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-medium" style={{ color: '#fafafa', fontFamily: 'Geist, sans-serif' }} htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@organization.com"
                  className="w-full h-11 px-4 border rounded-lg transition-all text-sm animate-pulse-once"
                  style={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fafafa' }}
                  value={email}
                  disabled={loading}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-medium" style={{ color: '#fafafa', fontFamily: 'Geist, sans-serif' }} htmlFor="password">
                    Password
                  </label>
                  <a href="#" className="text-xs hover:underline underline-offset-4" style={{ color: '#8b5cf6' }}>Forgot password?</a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="w-full h-11 px-4 border rounded-lg transition-all text-sm"
                    style={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fafafa' }}
                    value={password}
                    disabled={loading}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: '#71717a' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
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
                  Signing In...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Divider & Social Logins */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" style={{ borderColor: '#27272a' }}></span>
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-widest px-4" style={{ color: '#71717a', backgroundColor: '#09090b' }}>
              Or continue with
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="h-11 flex items-center justify-center gap-2 border bg-transparent rounded-lg text-sm" style={{ borderColor: '#27272a', color: '#fafafa' }}>
              <span>Google</span>
            </button>
            <button className="h-11 flex items-center justify-center gap-2 border bg-transparent rounded-lg text-sm" style={{ borderColor: '#27272a', color: '#fafafa' }}>
              <span>GitHub</span>
            </button>
          </div>

          <p className="text-center text-sm mt-8" style={{ color: '#71717a' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium hover:underline underline-offset-4" style={{ color: '#8b5cf6' }}>
              Sign up for a free trial
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}