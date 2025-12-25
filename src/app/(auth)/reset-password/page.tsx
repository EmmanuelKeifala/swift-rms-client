'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/lib/api';
import { Eye, EyeOff, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset code is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.resetPassword({
        token: data.token,
        newPassword: data.newPassword,
      });
      router.push('/login?reset=success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired reset code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="auth-form-header">
        <h1>Reset Password</h1>
        <p>Enter your reset code and choose a new password</p>
      </div>

      {error && (
        <div className="auth-error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label className="form-label" htmlFor="token">Reset Code</label>
          <input
            id="token"
            type="text"
            className={`form-input ${errors.token ? 'error' : ''}`}
            placeholder="Enter the code from SMS"
            {...register('token')}
          />
          {errors.token && <span className="form-error">{errors.token.message}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="newPassword">New Password</label>
          <div className="password-input-wrapper">
            <input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              className={`form-input ${errors.newPassword ? 'error' : ''}`}
              placeholder="Enter new password"
              {...register('newPassword')}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.newPassword && <span className="form-error">{errors.newPassword.message}</span>}
          <span className="form-hint">Must be at least 8 characters</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
            placeholder="Confirm new password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
        </div>

        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 0.6s linear infinite' }} />
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      <div className="auth-links">
        <Link href="/login" className="flex items-center justify-center gap-1 text-sm text-muted">
          <ArrowLeft size={14} />
          Back to Sign in
        </Link>
      </div>
    </>
  );
}
