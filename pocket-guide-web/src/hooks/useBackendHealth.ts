import { useCallback, useEffect, useState } from 'react'
import { checkBackendHealth, getBackendBaseUrl, isBackendApiEnabled } from '../services/backendApi'

interface BackendHealthState {
  enabled: boolean
  isOnline: boolean
  isChecking: boolean
  lastChecked: number | null
  error: string | null
  baseUrl: string
  refresh: () => Promise<void>
}

const POLL_INTERVAL_MS = 30000

export function useBackendHealth(): BackendHealthState {
  const enabled = isBackendApiEnabled()
  const baseUrl = getBackendBaseUrl()
  const [isOnline, setIsOnline] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled) {
      setIsOnline(false)
      setError('Backend API disabled in this environment')
      setLastChecked(Date.now())
      return
    }

    try {
      setIsChecking(true)
      setError(null)
      const health = await checkBackendHealth()
      setIsOnline(health.status === 'ok')
      setLastChecked(Date.now())
    } catch (err) {
      setIsOnline(false)
      setError(err instanceof Error ? err.message : 'Backend health check failed')
      setLastChecked(Date.now())
    } finally {
      setIsChecking(false)
    }
  }, [enabled])

  useEffect(() => {
    let mounted = true

    const run = async () => {
      if (!mounted) return
      await refresh()
    }

    run()

    if (!enabled) {
      return () => {
        mounted = false
      }
    }

    const intervalId = setInterval(run, POLL_INTERVAL_MS)

    return () => {
      mounted = false
      clearInterval(intervalId)
    }
  }, [enabled, refresh])

  return {
    enabled,
    isOnline,
    isChecking,
    lastChecked,
    error,
    baseUrl,
    refresh,
  }
}
