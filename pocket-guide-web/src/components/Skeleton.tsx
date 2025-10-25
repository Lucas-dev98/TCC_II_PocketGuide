import React from 'react'
import clsx from 'clsx'

interface SkeletonProps {
  className?: string
  count?: number
  height?: string
}

interface SkeletonTextProps {
  lines?: number
  className?: string
}

interface SkeletonCardProps {
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  count = 1,
  height = 'h-4',
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'skeleton',
            height,
            'rounded',
            i < count - 1 && 'mb-3',
            className
          )}
        />
      ))}
    </>
  )
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className,
}) => {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'skeleton',
            i === lines - 1 ? 'h-3' : 'h-4',
            'rounded',
            'mb-2',
            i === lines - 1 && 'w-3/4'
          )}
        />
      ))}
    </div>
  )
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className }) => {
  return (
    <div
      className={clsx(
        'card-base p-6 space-y-4',
        className
      )}
    >
      {/* Header */}
      <div>
        <Skeleton height="h-6" className="w-1/3 mb-2" />
        <Skeleton height="h-3" className="w-2/3" />
      </div>

      {/* Content */}
      <div className="space-y-3">
        <Skeleton height="h-4" />
        <Skeleton height="h-4" />
        <Skeleton height="h-4" className="w-5/6" />
      </div>

      {/* Footer */}
      <div className="flex gap-2 pt-4">
        <Skeleton height="h-10" className="flex-1 rounded-lg" />
        <Skeleton height="h-10" className="flex-1 rounded-lg" />
      </div>
    </div>
  )
}

export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  return (
    <div className={clsx('skeleton rounded-full', sizeClasses[size])} />
  )
}

export const SkeletonList: React.FC<{ count?: number; className?: string }> = ({
  count = 5,
  className,
}) => {
  return (
    <div className={clsx('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <SkeletonAvatar size="md" />
          <div className="flex-1">
            <Skeleton height="h-4" className="w-1/4 mb-2" />
            <Skeleton height="h-3" className="w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
