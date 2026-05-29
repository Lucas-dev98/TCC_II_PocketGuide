import React, { useCallback, useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose?: () => void
  isOpen?: boolean
}

const iconClasses = {
  success: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-600 dark:text-green-400',
    svg: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  error: {
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-600 dark:text-red-400',
    svg: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
  },
  warning: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-600 dark:text-yellow-400',
    svg: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  },
  info: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-600 dark:text-blue-400',
    svg: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  },
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 4000,
  onClose,
  isOpen = true,
}) => {
  const [show, setShow] = useState(isOpen)

  useEffect(() => {
    setShow(isOpen)
    if (!isOpen) return

    const timer = setTimeout(() => {
      setShow(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [isOpen, duration, onClose])

  if (!show) return null

  const icons = iconClasses[type]

  return (
    <div
      className={clsx(
        'fixed bottom-4 right-4 max-w-md',
        'animate-fade-in',
        'z-50'
      )}
      role="alert"
      aria-live="polite"
    >
      <div
        className={clsx(
          'flex items-center gap-3 p-4 rounded-lg',
          'bg-white dark:bg-slate-800',
          'border border-border dark:border-border-dark',
          'shadow-lg'
        )}
      >
        <div className={clsx('flex-shrink-0', icons.bg, icons.text, 'p-2 rounded-full')}>
          {icons.svg}
        </div>
        <p className="flex-1 text-body font-medium text-slate-900 dark:text-white">
          {message}
        </p>
        <button
          onClick={() => {
            setShow(false)
            onClose?.()
          }}
          className={clsx(
            'flex-shrink-0 text-slate-400 dark:text-slate-500',
            'hover:text-slate-600 dark:hover:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'dark:focus:ring-offset-slate-800',
            'rounded transition-colors'
          )}
          aria-label="Fechar notificação"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Array<ToastProps & { id: string }>
  onRemove: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )
}

// Hook para usar Toast facilmente
export const useToast = () => {
  const [toasts, setToasts] = React.useState<Array<ToastProps & { id: string }>>([])

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type, duration, isOpen: true }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showSuccess = useCallback((message: string, duration?: number) => addToast(message, 'success', duration), [addToast])
  const showError = useCallback((message: string, duration?: number) => addToast(message, 'error', duration), [addToast])
  const showWarning = useCallback((message: string, duration?: number) => addToast(message, 'warning', duration), [addToast])
  const showInfo = useCallback((message: string, duration?: number) => addToast(message, 'info', duration), [addToast])

  return useMemo(() => ({
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }), [toasts, addToast, removeToast, showSuccess, showError, showWarning, showInfo])
}
