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
  <div className={clsx('flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-700 flex-wrap sm:flex-nowrap', className)}>
    {children ? (
      children
    ) : (
      <div className="flex-1 min-w-0">
        {title && <h3 className="text-base sm:text-h3 font-semibold text-slate-900 dark:text-white truncate">{title}</h3>}
        {subtitle && <p className="text-xs sm:text-small text-slate-600 dark:text-slate-400 truncate">{subtitle}</p>}
      </div>
    )}
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
)

const CardBodyComponent: React.FC<CardBodyProps> = ({ children, className = '' }) => (
  <div className={clsx('overflow-visible', className)}>
    {children}
  </div>
)

const CardFooterComponent: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={clsx('mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-slate-200 dark:border-slate-700', className)}>
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
        'p-3 sm:p-4',
        'overflow-visible',
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