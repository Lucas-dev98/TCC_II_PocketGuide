import React from 'react'
import clsx from 'clsx'

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
}

const variantClasses = {
  primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  secondary: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
}

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  icon,
}) => {
  return (
    <span
      className={clsx(
        'badge-base',
        'rounded-full font-medium',
        'inline-flex items-center gap-1',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {icon && <span>{icon}</span>}
      {children}
    </span>
  )
}
