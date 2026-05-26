import { describe, expect, it } from 'vitest'
import { ApiRequestError, mapBackendErrorToUserMessage } from './backendApi'

describe('mapBackendErrorToUserMessage', () => {
  it('returns friendly message for typed API errors', () => {
    const err = new ApiRequestError('Não foi possível conectar ao backend local.', 'network')
    expect(mapBackendErrorToUserMessage(err)).toBe('Não foi possível conectar ao backend local.')
  })

  it('maps generic fetch error to backend hint', () => {
    const err = new Error('Failed to fetch')
    expect(mapBackendErrorToUserMessage(err)).toContain('Backend indisponível')
  })

  it('handles unknown errors safely', () => {
    expect(mapBackendErrorToUserMessage(null)).toBe('Erro inesperado ao comunicar com o backend.')
  })
})
