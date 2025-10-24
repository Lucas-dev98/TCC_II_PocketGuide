import React from 'react'
import clsx from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  help?: string
  icon?: React.ReactNode
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  help,
  icon,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={clsx(
            'input-base',
            icon && 'pl-10',
            error && 'border-red-300 focus:ring-red-500 focus:border-transparent',
            className,
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {help && !error && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{help}</p>
      )}
    </div>
  )
}
