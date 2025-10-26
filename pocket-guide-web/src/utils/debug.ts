/**
 * Debug Utility - Controla logs baseado em environment
 * 
 * Uso:
 * import { debug } from '@/utils/debug'
 * 
 * debug('Minha mensagem', data) // Só aparece se VITE_DEBUG=true
 */

const DEBUG = import.meta.env.VITE_DEBUG === 'true'

export const debug = {
  log: (...args: any[]) => {
    if (DEBUG) console.log(...args)
  },
  warn: (...args: any[]) => {
    if (DEBUG) console.warn(...args)
  },
  info: (...args: any[]) => {
    if (DEBUG) console.info(...args)
  },
  // Errors sempre são mostrados (críticos)
  error: (...args: any[]) => {
    console.error(...args)
  },
}

export const isDebugMode = DEBUG
