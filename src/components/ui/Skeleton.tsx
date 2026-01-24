'use client';

import { CSSProperties, ReactNode } from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: CSSProperties;
}

const shimmerStyle: CSSProperties = {
  background: 'linear-gradient(90deg, var(--gray-100) 0%, var(--gray-50) 50%, var(--gray-100) 100%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
};

export function Skeleton({ 
  width = '100%', 
  height = '20px', 
  borderRadius = 'var(--radius-md)',
  className,
  style,
}: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        ...shimmerStyle,
        ...style,
      }}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--space-4)', 
        padding: 'var(--space-4) var(--space-5)',
        background: 'linear-gradient(180deg, var(--gray-50) 0%, rgba(244, 244, 245, 0.7) 100%)',
        borderBottom: '1px solid var(--border)',
      }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="14px" width={i === 0 ? '100px' : '80px'} />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div 
          key={rowIdx}
          style={{ 
            display: 'flex', 
            gap: 'var(--space-4)', 
            padding: 'var(--space-4) var(--space-5)',
            borderBottom: rowIdx === rows - 1 ? 'none' : '1px solid var(--border)',
          }}
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton 
              key={colIdx} 
              height="16px" 
              width={colIdx === 0 ? '120px' : colIdx === 1 ? '80px' : '100px'} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card" style={{ minHeight: '140px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <Skeleton width="100px" height="14px" />
        <Skeleton width="48px" height="48px" borderRadius="var(--radius-lg)" />
      </div>
      <Skeleton width="60px" height="32px" style={{ marginBottom: 'var(--space-2)' }} />
      <Skeleton width="80px" height="12px" />
    </div>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card">
      <Skeleton width="40%" height="20px" style={{ marginBottom: 'var(--space-4)' }} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          width={i === lines - 1 ? '60%' : '100%'} 
          height="14px" 
          style={{ marginBottom: i === lines - 1 ? 0 : 'var(--space-2)' }} 
        />
      ))}
    </div>
  );
}

// Add shimmer animation to globals.css or inline it
// This component assumes the following CSS exists:
// @keyframes shimmer {
//   0% { background-position: 200% 0; }
//   100% { background-position: -200% 0; }
// }
