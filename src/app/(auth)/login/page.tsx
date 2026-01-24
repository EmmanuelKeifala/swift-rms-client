'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/lib/api';
import { useAuthStore } from '@/store';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowRight, Lock } from 'lucide-react';

const loginSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const resetSuccess = searchParams.get('reset') === 'success';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login({
        phone: `+232${data.phone}`,
        password: data.password,
      });
      
      setUser(response.user);
      router.push('/');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Invalid credentials. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="auth-form-header">
        <h1>Welcome back</h1>
        <p>Sign in to continue to your dashboard</p>
      </div>

      {resetSuccess && (
        <div className="auth-success">
          <CheckCircle2 size={18} strokeWidth={2} />
          <span>Password reset successfully. Please sign in with your new password.</span>
        </div>
      )}

      {error && (
        <div className="auth-error">
          <AlertCircle size={18} strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label className="form-label" htmlFor="phone">Phone Number</label>
          <div className="phone-input-wrapper">
            <span className="phone-prefix">+232</span>
            <input
              id="phone"
              type="tel"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="76 XXX XXXX"
              autoComplete="tel"
              {...register('phone')}
            />
          </div>
          {errors.phone && (
            <span className="form-error">
              <AlertCircle size={12} />
              {errors.phone.message}
            </span>
          )}
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
            <Link 
              href="/forgot-password" 
              style={{ 
                fontSize: '13px', 
                color: 'var(--blue-500)', 
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Forgot password?
            </Link>
          </div>
          <div className="password-input-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              autoComplete="current-password"
              {...register('password')}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <span className="form-error">
              <AlertCircle size={12} />
              {errors.password.message}
            </span>
          )}
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-lg" 
          style={{ 
            width: '100%', 
            marginTop: '8px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            border: 'none',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
          }} 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 0.6s linear infinite' }} />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {/* Security notice */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '8px',
        marginTop: '24px',
        padding: '12px',
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.03))',
        borderRadius: '10px',
        border: '1px solid rgba(34, 197, 94, 0.15)',
      }}>
        <Lock size={14} style={{ color: 'var(--green-500)' }} />
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
          Secured with end-to-end encryption
        </span>
      </div>

      <div className="auth-footer">
        <p style={{ fontWeight: 500, color: 'var(--foreground)' }}>RMS Healthcare Platform</p>
        <p>Sierra Leone Ministry of Health</p>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center', 
        padding: '60px',
        gap: '12px'
      }}>
        <div className="spinner spinner-lg" />
        <span style={{ color: 'var(--muted)', fontSize: '14px' }}>Loading...</span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
