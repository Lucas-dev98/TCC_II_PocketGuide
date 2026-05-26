import { describe, expect, it } from 'vitest'
import { addDays, daysBetween, formatTime } from './formatDate'

describe('formatDate utils', () => {
  it('returns original time format when already HH:mm', () => {
    expect(formatTime('09:30')).toBe('09:30')
  })

  it('calculates day difference', () => {
    const start = new Date('2025-01-01')
    const end = new Date('2025-01-03')
    expect(daysBetween(start, end)).toBe(2)
  })

  it('adds days to date', () => {
    const result = addDays(new Date(2025, 0, 10), 5)
    expect(result.getDate()).toBe(15)
  })
})
