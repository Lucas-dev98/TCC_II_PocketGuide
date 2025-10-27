/**
 * ShareButton.tsx - Botão de compartilhamento
 * 
 * Componente versátil para compartilhar viagens com:
 * - Ícone de compartilhamento
 * - Menu de opções (copiar link, web share, email)
 * - Feedback visual de ação
 */

import { useState, useRef, useEffect } from 'react'
import { Share2, Copy, Mail, Check, ArrowUpRight } from 'lucide-react'
import { Trip } from '../types'
import { sharingService } from '../services/sharingService'

interface ShareButtonProps {
  trip: Trip
  size?: 'sm' | 'md' | 'lg'
  variant?: 'icon' | 'filled'
  className?: string
  onShare?: (shareUrl: string) => void
}

export const ShareButton = ({
  trip,
  size = 'md',
  variant = 'icon',
  className = '',
  onShare,
}: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Generate share URL
  const shareUrl = sharingService.generateShareUrl(trip, 'view')

  // Size classes
  const sizeClasses = {
    sm: 'p-1.5 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg',
  }

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  // Handle copy to clipboard
  const handleCopyLink = async () => {
    setLoading(true)
    const success = await sharingService.copyToClipboard(shareUrl)
    
    if (success) {
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setIsOpen(false)
      }, 2000)
    }
    
    setLoading(false)
  }

  // Handle web share
  const handleWebShare = async () => {
    setLoading(true)
    const success = await sharingService.shareViaWebShare(trip, shareUrl)
    
    if (success) {
      setIsOpen(false)
      onShare?.(shareUrl)
    }
    
    setLoading(false)
  }

  // Handle email share
  const handleEmailShare = () => {
    const subject = `Conheça minha viagem: ${trip.destination}`
    const body = `Olá! Confira minha viagem para ${trip.destination}:\n\n${shareUrl}`
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    window.location.href = mailtoLink
    setIsOpen(false)
    onShare?.(shareUrl)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Icon variant
  if (variant === 'icon') {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="Compartilhar viagem"
          className={`
            ${sizeClasses[size]}
            rounded-lg
            bg-blue-50 dark:bg-blue-950
            hover:bg-blue-100 dark:hover:bg-blue-900
            text-blue-600 dark:text-blue-400
            transition-colors
            ${className}
          `}
        >
          <Share2 className={iconSizeClasses[size]} />
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 py-1">
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              disabled={loading}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar link</span>
                </>
              )}
            </button>

            {/* Web Share */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleWebShare}
                disabled={loading}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Compartilhar</span>
              </button>
            )}

            {/* Email Share */}
            <button
              onClick={handleEmailShare}
              disabled={loading}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              <span>Enviar por email</span>
            </button>

            {/* Share info */}
            <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
              <p className="truncate">{shareUrl}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Filled variant
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${sizeClasses[size]}
          px-4 py-2
          rounded-lg
          bg-blue-600 dark:bg-blue-700
          hover:bg-blue-700 dark:hover:bg-blue-600
          text-white
          font-medium
          flex items-center gap-2
          transition-colors
          ${className}
        `}
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">Compartilhar</span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 py-1">
          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            disabled={loading}
            className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar link</span>
              </>
            )}
          </button>

          {/* Web Share */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleWebShare}
              disabled={loading}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Compartilhar</span>
            </button>
          )}

          {/* Email Share */}
          <button
            onClick={handleEmailShare}
            disabled={loading}
            className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <Mail className="w-4 h-4" />
            <span>Enviar por email</span>
          </button>

          {/* Share info */}
          <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
            <p className="truncate">{shareUrl}</p>
          </div>
        </div>
      )}
    </div>
  )
}
