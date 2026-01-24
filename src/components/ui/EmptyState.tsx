'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { LucideIcon, FileX } from 'lucide-react';

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  children?: ReactNode;
}

/**
 * EmptyState - Consistent empty state component for when there's no data
 * 
 * Features:
 * - Customizable icon, title, and description
 * - Primary and secondary action buttons
 * - Accessible and follows design system
 * - No dead ends - always offers a next step
 * 
 * @example
 * <EmptyState
 *   icon={Users}
 *   title="No patients found"
 *   description="Get started by registering a new patient"
 *   action={{ label: "Add Patient", href: "/patients/new" }}
 * />
 */
export function EmptyState({
  icon: Icon = FileX,
  title,
  description,
  action,
  secondaryAction,
  children,
}: EmptyStateProps) {
  return (
    <div className="empty-state" role="status" aria-label={title}>
      <div className="empty-state-icon">
        <Icon size={28} strokeWidth={1.5} aria-hidden="true" />
      </div>
      
      <h3 className="empty-state-title">{title}</h3>
      
      {description && (
        <p className="empty-state-description">{description}</p>
      )}
      
      {(action || secondaryAction) && (
        <div 
          style={{ 
            display: 'flex', 
            gap: 'var(--space-3)', 
            marginTop: 'var(--space-5)',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}
        >
          {action && (
            action.href ? (
              <Link 
                href={action.href} 
                className={`btn btn-${action.variant || 'primary'}`}
              >
                {action.label}
              </Link>
            ) : (
              <button 
                onClick={action.onClick}
                className={`btn btn-${action.variant || 'primary'}`}
              >
                {action.label}
              </button>
            )
          )}
          
          {secondaryAction && (
            secondaryAction.href ? (
              <Link 
                href={secondaryAction.href} 
                className={`btn btn-${secondaryAction.variant || 'secondary'}`}
              >
                {secondaryAction.label}
              </Link>
            ) : (
              <button 
                onClick={secondaryAction.onClick}
                className={`btn btn-${secondaryAction.variant || 'secondary'}`}
              >
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      )}
      
      {children}
    </div>
  );
}
