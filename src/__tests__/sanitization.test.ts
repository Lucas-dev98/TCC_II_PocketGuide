/**
 * Input Sanitization Tests
 * Tests sanitization and validation of user inputs
 */

import { describe, it, expect } from '@jest/globals';

/**
 * Sanitize destination input - copied from CreateTripScreen
 */
const sanitizeDestination = (input: string): string => {
  return input
    .replace(/^[^a-zA-Z]*/, '') // Remove leading emoji/special chars
    .trim()
    .slice(0, 100) // Max 100 characters
    .replace(/[<>\"']/g, ''); // Remove dangerous characters
};

describe('Input Sanitization', () => {
  it('should remove leading emojis', () => {
    expect(sanitizeDestination('🗼 Paris')).toBe('Paris');
    expect(sanitizeDestination('🗽 New York')).toBe('New York');
    expect(sanitizeDestination('🏖️ Bali')).toBe('Bali');
  });

  it('should remove dangerous characters', () => {
    expect(sanitizeDestination('Paris<script>')).toBe('Parisscript');
    expect(sanitizeDestination('New"York')).toBe('NewYork');
    expect(sanitizeDestination("Rome'Italia")).toBe('RomeItalia');
  });

  it('should trim whitespace', () => {
    expect(sanitizeDestination('  Paris  ')).toBe('Paris');
    expect(sanitizeDestination('\nBali\n')).toBe('Bali');
  });

  it('should limit to 100 characters', () => {
    const longInput = 'a'.repeat(150);
    const result = sanitizeDestination(longInput);
    expect(result.length).toBeLessThanOrEqual(100);
  });

  it('should handle mixed cases', () => {
    const input = '🗼 Paris, France <script>alert()</script>';
    const result = sanitizeDestination(input);
    // Remove < > but keep other chars
    expect(result).toBe('Paris, France scriptalert()/script');
  });

  it('should preserve valid characters', () => {
    expect(sanitizeDestination('São Paulo')).toBe('São Paulo');
    expect(sanitizeDestination('New York City')).toBe('New York City');
    expect(sanitizeDestination('Rio de Janeiro')).toBe('Rio de Janeiro');
  });

  it('should return empty string for invalid input', () => {
    // 123 starts with number, so after removing leading non-letters, it becomes empty
    expect(sanitizeDestination('123')).toBe('');
    expect(sanitizeDestination('!@#$%')).toBe('');
    expect(sanitizeDestination('🗼')).toBe('');
  });

  it('should handle multiple spaces', () => {
    expect(sanitizeDestination('Paris   France')).toBe('Paris   France');
  });

  it('should be XSS safe', () => {
    const xssAttempts = [
      '<img src=x onerror=alert(1)>',
      '"><script>alert(1)</script>',
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
    ];

    xssAttempts.forEach(attempt => {
      const result = sanitizeDestination(attempt);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).not.toContain('"');
      expect(result).not.toContain("'");
    });
  });
});
