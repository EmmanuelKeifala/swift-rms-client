'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/lib/api';
import { ArrowLeft, Loader2, ArrowRight, Mail } from 'lucide-react';

const forgotPasswordSchema = z.object({
  phone: z.string()
    .min(9, 'Phone number must be 9 digits')
    .max(9, 'Phone number must be 9 digits')
    .regex(/^[0-9]{9}$/, 'Phone number must be 9 digits (e.g., 76000002)'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      let phone = data.phone;
      if (!phone.startsWith('+')) {
        phone = '+232' + phone.replace(/^0/, '');
      }
      await authService.forgotPassword({ phone });
    } catch {
      // Always show success to prevent user enumeration
    } finally {
      setIsLoading(false);
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <>
        <div className="auth-form-header">
          <div style={{ 
            width: 64, 
            height: 64, 
            margin: '0 auto var(--space-4)', 
            background: 'var(--success-light)', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Mail size={28} style={{ color: 'var(--success)' }} />
          </div>
          <h1>Check Your Phone</h1>
          <p>If an account exists with this phone number, you will receive a reset code via SMS</p>
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
          <Link href="/reset-password" className="btn btn-primary btn-lg">
            Enter Reset Code
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="auth-links" style={{ marginTop: 'var(--space-6)' }}>
          <Link href="/login" className="flex items-center justify-center gap-1 text-sm text-muted">
            <ArrowLeft size={14} />
            Back to Sign in
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="auth-form-header">
        <h1>Forgot Password?</h1>
        <p>Enter your phone number and we&apos;ll send you a reset code</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label className="form-label" htmlFor="phone">Phone Number</label>
          <div className="phone-input-wrapper">
            <span className="phone-prefix">+232</span>
            <input
              id="phone"
              type="tel"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="XX XXX XXXX"
              {...register('phone')}
              autoComplete="tel"
            />
          </div>
          {errors.phone && <span className="form-error">{errors.phone.message}</span>}
        </div>

        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 0.6s linear infinite' }} />
              Sending...
            </>
          ) : (
            'Send Reset Code'
          )}
        </button>
      </form>

      <div className="auth-links" style={{ marginTop: 'var(--space-6)' }}>
        <Link href="/login" className="flex items-center justify-center gap-1 text-sm text-muted">
          <ArrowLeft size={14} />
          Back to Sign in
        </Link>
      </div>
    </>
  );
}
