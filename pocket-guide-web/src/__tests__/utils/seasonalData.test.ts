import { describe, it, expect } from 'vitest';
import {
  getSeasonalData,
  getMonthStatus,
  getMonthReason,
  SEASONAL_DATA,
  MONTHS,
} from '../../utils/seasonalData';

describe('Seasonal Data Utilities', () => {
  it('should have seasonal data for major destinations', () => {
    expect(SEASONAL_DATA['Lisboa']).toBeDefined();
    expect(SEASONAL_DATA['Barcelona']).toBeDefined();
    expect(SEASONAL_DATA['Roma']).toBeDefined();
    expect(SEASONAL_DATA['Paris']).toBeDefined();
  });

  it('should return default seasonal data for unknown destination', () => {
    const data = getSeasonalData('Unknown City');
    expect(data).toBeDefined();
    expect(data.bestMonths).toBeDefined();
    expect(data.climate).toBe('Temperado');
  });

  it('should correctly identify best months for Lisboa', () => {
    const status4 = getMonthStatus('Lisboa', 4); // April
    const status5 = getMonthStatus('Lisboa', 5); // May
    expect(status4).toBe('best');
    expect(status5).toBe('best');
  });

  it('should correctly identify avoid months', () => {
    const status1 = getMonthStatus('Algarve', 12); // December
    expect(status1).toBe('avoid');
  });

  it('should return warning for intermediate months', () => {
    const status = getMonthStatus('Lisboa', 11); // November
    expect(status).toBe('warning');
  });

  it('should return reasons for bad months', () => {
    const reasons = getMonthReason('Lisboa', 1); // January
    expect(reasons).toBeDefined();
    expect(Array.isArray(reasons)).toBe(true);
  });

  it('should handle all 12 months', () => {
    expect(MONTHS.length).toBe(12);
    MONTHS.forEach((month) => {
      expect(month.number).toBeGreaterThanOrEqual(1);
      expect(month.number).toBeLessThanOrEqual(12);
      expect(month.name).toBeDefined();
      expect(month.abbr).toBeDefined();
    });
  });

  it('should have complete data structure for each destination', () => {
    Object.values(SEASONAL_DATA).forEach((data) => {
      expect(data.bestMonths).toBeDefined();
      expect(Array.isArray(data.bestMonths)).toBe(true);
      expect(data.warningMonths).toBeDefined();
      expect(Array.isArray(data.warningMonths)).toBe(true);
      expect(data.avoidMonths).toBeDefined();
      expect(Array.isArray(data.avoidMonths)).toBe(true);
      expect(data.climate).toBeDefined();
    });
  });

  it('should not have overlapping best/avoid months for same destination', () => {
    Object.values(SEASONAL_DATA).forEach((data) => {
      const overlap = data.bestMonths.filter((m) =>
        data.avoidMonths.includes(m)
      );
      expect(overlap).toHaveLength(0);
    });
  });

  it('should return non-empty reasons array', () => {
    const reasons = getMonthReason('Lisboa', 5); // May - best month
    expect(reasons).toBeDefined();
    expect(Array.isArray(reasons)).toBe(true);
    expect(reasons.length).toBeGreaterThan(0);
  });

  it('should have valid month abbreviations', () => {
    const abbrs = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    MONTHS.forEach((month, idx) => {
      expect(month.abbr).toBe(abbrs[idx]);
    });
  });
});
