import React from 'react'
import clsx from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 'sm' | 'md' | 'lg' | 'xl'
  isInteractive?: boolean
  children: React.ReactNode
}

interface CardHeaderProps {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

interface CardBodyProps {
  children: React.ReactNode
  className?: string
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

interface CardComponent extends React.FC<CardProps> {
  Header: React.FC<CardHeaderProps>
  Body: React.FC<CardBodyProps>
  Footer: React.FC<CardFooterProps>
}

const elevationClasses = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
}

const CardHeaderComponent: React.FC<CardHeaderProps> = ({ title, subtitle, action, children, className = '' }) => (
  <div className={clsx('flex items-start justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700', className)}>
    {children ? (
      children
    ) : (
      <div>
        {title && <h3 className="text-h3 font-semibold text-slate-900 dark:text-white">{title}</h3>}
        {subtitle && <p className="text-small text-slate-600 dark:text-slate-400">{subtitle}</p>}
      </div>
    )}
    {action && <div>{action}</div>}
  </div>
)

const CardBodyComponent: React.FC<CardBodyProps> = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
)

const CardFooterComponent: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={clsx('mt-4 pt-4 border-t border-slate-200 dark:border-slate-700', className)}>
    {children}
  </div>
)

const CardComponent: React.FC<CardProps> = ({
  elevation = 'md',
  isInteractive = false,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'card-base',
        'bg-white dark:bg-slate-800',
        'rounded-lg',
        'border border-slate-200 dark:border-slate-700',
        elevationClasses[elevation],
        'p-4',
        isInteractive && 'card-interactive',
        isInteractive && 'hover:shadow-lg hover:-translate-y-1 active:shadow-md active:translate-y-0',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Composição
const Card = CardComponent as CardComponent
Card.Header = CardHeaderComponent
Card.Body = CardBodyComponent
Card.Footer = CardFooterComponent

export { Card }