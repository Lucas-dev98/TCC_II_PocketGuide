import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Nova paleta Indigo
        primary: '#6366F1',
        'primary-dark': '#4F46E5',
        'primary-light': '#818CF8',
        
        // Secondary - Emerald mantém
        secondary: '#10B981',
        'secondary-dark': '#059669',
        'secondary-light': '#6EE7B7',
        
        // Accent - Amber para CTAs
        accent: '#F59E0B',
        'accent-dark': '#D97706',
        
        // Status colors
        danger: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        
        // Semantic
        muted: '#6B7280',
        surface: '#F9FAFB',
        'surface-dark': '#111827',
        border: '#E5E7EB',
        'border-dark': '#374151',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
      },
      fontSize: {
        // Heading hierarchy
        'h1': ['40px', { lineHeight: '1.1', fontWeight: '600' }],
        'h2': ['32px', { lineHeight: '1.2', fontWeight: '600' }],
        'h3': ['24px', { lineHeight: '1.3', fontWeight: '500' }],
        'h4': ['20px', { lineHeight: '1.3', fontWeight: '500' }],
        
        // Body text
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'small': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
        
        // Legacy sizes for compatibility
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.15), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.2), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        // New glow shadows
        'glow': '0 0 20px rgb(99 102 241 / 0.3)',
        'glow-lg': '0 0 30px rgb(99 102 241 / 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // New animations
        'bounce-sm': 'bounceSm 0.6s ease-in-out',
        'pulse-ring': 'pulseRing 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          'from': { transform: 'translateY(-20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          'from': { transform: 'scale(0.95)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        // New keyframes
        bounceSm: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgb(99 102 241 / 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgb(99 102 241 / 0)' },
          '100%': { boxShadow: '0 0 0 0 rgb(99 102 241 / 0)' },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [forms, typography],
}

export default config
