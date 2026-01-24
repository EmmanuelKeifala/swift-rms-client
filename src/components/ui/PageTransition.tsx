'use client';

import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageTransition - Wraps page content with smooth entrance animation
 * 
 * Features:
 * - Fade-in-up animation for page content
 * - Respects prefers-reduced-motion
 * - Minimal wrapper, CSS-only implementation
 * 
 * @example
 * <PageTransition>
 *   <YourPageContent />
 * </PageTransition>
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <div 
      className={`page-transition ${className}`}
      style={{
        animation: 'page-enter var(--duration-smooth) var(--ease) forwards',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Staggered animation wrapper for lists of items
 */
interface StaggeredListProps {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export function StaggeredList({ 
  children, 
  staggerDelay = 50,
  className = '' 
}: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          style={{
            animation: 'fade-in-up var(--duration-smooth) var(--ease) forwards',
            animationDelay: `${index * staggerDelay}ms`,
            opacity: 0,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
