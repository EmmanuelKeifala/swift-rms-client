'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2, LucideIcon } from 'lucide-react';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
}

/**
 * LoadingButton - A button component that handles loading states gracefully
 * 
 * Features:
 * - Preserves button width during loading (no layout shift)
 * - Shows spinner + optional loading text
 * - Disables interaction during loading
 * - Supports all button variants and sizes
 * 
 * @example
 * <LoadingButton loading={isSubmitting} loadingText="Saving...">
 *   Save Changes
 * </LoadingButton>
 */
export function LoadingButton({
  loading = false,
  loadingText,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  ...props
}: LoadingButtonProps) {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  
  const classes = [baseClass, variantClass, sizeClass, className]
    .filter(Boolean)
    .join(' ');

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;

  return (
    <button
      className={classes}
      disabled={loading || disabled}
      aria-busy={loading}
      aria-disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 
            size={iconSize} 
            style={{ animation: 'spin 0.6s linear infinite' }}
            aria-hidden="true"
          />
          {loadingText || children}
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon size={iconSize} aria-hidden="true" />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon size={iconSize} aria-hidden="true" />
          )}
        </>
      )}
    </button>
  );
}
