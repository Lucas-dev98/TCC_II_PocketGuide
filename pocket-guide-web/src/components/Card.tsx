import React from 'react'
import clsx from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
}

const elevationClasses = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
}

export const Card: React.FC<CardProps> = ({
  elevation = 'md',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'card-base',
        elevationClasses[elevation],
        'p-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
    <div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
)

interface CardBodyProps {
  children: React.ReactNode
  className?: string
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
)

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={clsx('mt-4 pt-4 border-t border-slate-200 dark:border-slate-700', className)}>
    {children}
  </div>
)
