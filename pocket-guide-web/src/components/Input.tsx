import React from 'react'
import clsx from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  help?: string
  icon?: React.ReactNode
  isValid?: boolean
  required?: boolean
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  help,
  icon,
  isValid,
  required,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  const hasError = !!error
  const showSuccess = isValid && !hasError

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
        >
          {label}
          {required && <span className="text-danger ml-1" aria-label="required">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={clsx(
            'input-base',
            icon && 'pl-10',
            hasError && 'input-error',
            showSuccess && 'input-success',
            className,
          )}
          aria-invalid={hasError}
          aria-describedby={error ? `${inputId}-error` : help ? `${inputId}-help` : undefined}
          {...props}
        />
        {showSuccess && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success pointer-events-none">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {hasError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-danger pointer-events-none">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      {error && (
        <p 
          id={`${inputId}-error`}
          className="mt-1 text-sm text-danger dark:text-red-400 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {help && !error && (
        <p 
          id={`${inputId}-help`}
          className="mt-1 text-sm text-slate-600 dark:text-slate-300"
        >
          {help}
        </p>
      )}
    </div>
  )
}
