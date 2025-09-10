'use client'

import React from 'react'
import { clsx } from 'clsx'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number
  height?: string | number
  variant?: 'rectangular' | 'circular' | 'text' | 'rounded'
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({ 
  className, 
  width, 
  height, 
  variant = 'rectangular',
  animation = 'pulse',
  style,
  ...props 
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200'
  
  const variantClasses = {
    rectangular: 'rounded-none',
    circular: 'rounded-full',
    text: 'rounded-sm',
    rounded: 'rounded-lg'
  }
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'loading-shimmer',
    none: ''
  }

  const combinedStyle = {
    width,
    height,
    ...style
  }

  return (
    <div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={combinedStyle}
      {...props}
    />
  )
}

// Predefined skeleton components for common use cases

export function TextSkeleton({ 
  lines = 1, 
  className,
  ...props 
}: { 
  lines?: number 
  className?: string 
} & Omit<SkeletonProps, 'variant'>) {
  if (lines === 1) {
    return (
      <Skeleton 
        variant="text" 
        height="1rem" 
        className={clsx('w-3/4', className)}
        {...props} 
      />
    )
  }

  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height="1rem"
          className={i === lines - 1 ? 'w-1/2' : 'w-full'}
          {...props}
        />
      ))}
    </div>
  )
}

export function AvatarSkeleton({ 
  size = 40,
  className,
  ...props 
}: { 
  size?: number 
  className?: string 
} & Omit<SkeletonProps, 'variant' | 'width' | 'height'>) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
      {...props}
    />
  )
}

export function CardSkeleton({ className, ...props }: { className?: string } & Omit<SkeletonProps, 'variant'>) {
  return (
    <div className={clsx('p-6 border border-gray-200 rounded-lg', className)}>
      <div className="space-y-4">
        <Skeleton variant="rounded" height="12rem" />
        <div className="space-y-2">
          <Skeleton variant="text" height="1.5rem" className="w-3/4" />
          <TextSkeleton lines={2} />
        </div>
        <div className="flex gap-2">
          <Skeleton variant="rounded" height="2rem" className="w-20" />
          <Skeleton variant="rounded" height="2rem" className="w-16" />
        </div>
      </div>
    </div>
  )
}

export function ProjectCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('border border-gray-200 rounded-lg overflow-hidden', className)}>
      <Skeleton height="12rem" className="w-full" />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" height="1.25rem" className="w-3/4" />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AvatarSkeleton size={24} />
            <TextSkeleton className="w-20" />
          </div>
          <Skeleton variant="rounded" height="1.5rem" className="w-16" />
        </div>
      </div>
    </div>
  )
}

export function DashboardStatSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Skeleton variant="circular" width={32} height={32} />
        </div>
        <div className="ml-4 flex-1 space-y-2">
          <Skeleton variant="text" height="0.875rem" className="w-2/3" />
          <div className="flex items-baseline space-x-2">
            <Skeleton variant="text" height="2rem" className="w-16" />
            <Skeleton variant="text" height="0.875rem" className="w-12" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function TableRowSkeleton({ 
  columns = 4,
  className 
}: { 
  columns?: number
  className?: string 
}) {
  return (
    <tr className={className}>
      {Array.from({ length: columns }, (_, i) => (
        <td key={i} className="px-6 py-4">
          <TextSkeleton />
        </td>
      ))}
    </tr>
  )
}

export function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('flex items-center space-x-3 p-3', className)}>
      <AvatarSkeleton size={48} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" height="1rem" className="w-1/2" />
        <TextSkeleton lines={2} />
      </div>
      <Skeleton variant="rounded" height="2rem" className="w-20" />
    </div>
  )
}

// Loading state component that shows skeleton while content is loading
export function SkeletonLoader({
  loading,
  skeleton,
  children,
  error,
  errorFallback
}: {
  loading: boolean
  skeleton: React.ReactNode
  children: React.ReactNode
  error?: boolean
  errorFallback?: React.ReactNode
}) {
  if (error && errorFallback) {
    return <>{errorFallback}</>
  }
  
  if (loading) {
    return <>{skeleton}</>
  }
  
  return <>{children}</>
}