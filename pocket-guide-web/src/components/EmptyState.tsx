import React from 'react'
import clsx from 'clsx'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const defaultIcon = (
  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
)

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = defaultIcon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center py-12 px-4',
        className
      )}
    >
      <div className="text-slate-400 dark:text-slate-500 mb-4">
        {icon}
      </div>

      <h3 className="text-h3 font-semibold text-slate-900 dark:text-white mb-2 text-center">
        {title}
      </h3>

      {description && (
        <p className="text-body text-slate-600 dark:text-slate-400 mb-6 text-center max-w-md">
          {description}
        </p>
      )}

      {action && (
        <Button
          variant="primary"
          size="md"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
