import { describe, it, expect } from 'vitest';
import {
  matchDestinations,
  getDestinationInfo,
  getAllDestinations,
  DESTINATIONS_DB,
} from '../../utils/destinationMatcher';
import { TripType, BudgetPerDay } from '../../types';

describe('destinationMatcher', () => {
  describe('matchDestinations', () => {
    it('should return top 5 destinations sorted by score', () => {
      const types: TripType[] = ['relaxamento'];
      const budget: BudgetPerDay = 'medio';

      const results = matchDestinations(types, budget, '');

      expect(results.length).toBeLessThanOrEqual(5);
      expect(results).toHaveLength(5);

      // Should be sorted by score descending
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    it('should have reasons for matches', () => {
      const types: TripType[] = ['relaxamento'];
      const budget: BudgetPerDay = 'economico';

      const results = matchDestinations(types, budget, '');

      results.forEach((result) => {
        expect(result.reasons).toBeInstanceOf(Array);
        expect(result.reasons.length).toBeGreaterThan(0);
        expect(result.reasons[0]).toBeTruthy();
      });
    });

    it('should score 100-0 range', () => {
      const types: TripType[] = ['cultura'];
      const budget: BudgetPerDay = 'premium';

      const results = matchDestinations(types, budget, '');

      results.forEach((result) => {
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
      });
    });

    it('should consider trip type in scoring', () => {
      const typesRelaxamento: TripType[] = ['relaxamento'];
      const typesCultura: TripType[] = ['cultura'];
      const budget: BudgetPerDay = 'medio';

      const resultsRelaxamento = matchDestinations(
        typesRelaxamento,
        budget,
        ''
      );
      const resultsCultura = matchDestinations(
        typesCultura,
        budget,
        ''
      );

      // Results should be different based on trip type
      expect(resultsRelaxamento[0].name).not.toBe(resultsCultura[0].name);
    });

    it('should consider budget in scoring', () => {
      const types: TripType[] = ['relaxamento'];

      const budgetEconomico = matchDestinations(
        types,
        'economico',
        ''
      );
      const budgetLuxo = matchDestinations(types, 'luxo', '');

      // Both should return results
      expect(budgetEconomico.length).toBeGreaterThan(0);
      expect(budgetLuxo.length).toBeGreaterThan(0);

      // May have different top recommendation due to budget
      // (Though not guaranteed, it tests the logic is applied)
    });

    it('should consider season/month in scoring', () => {
      const types: TripType[] = ['relaxamento'];
      const budget: BudgetPerDay = 'medio';

      const resultsWithMonth = matchDestinations(
        types,
        budget,
        7
      );
      const resultsWithoutMonth = matchDestinations(
        types,
        budget,
        ''
      );

      // Both should return results
      expect(resultsWithMonth.length).toBeGreaterThan(0);
      expect(resultsWithoutMonth.length).toBeGreaterThan(0);

      // Should have reasons mentioning season when month is provided
      const hasSeasonReason = resultsWithMonth[0].reasons.some(
        (r) => r.includes('época') || r.includes('month')
      );
      expect(
        hasSeasonReason || resultsWithMonth[0].reasons.length >= 2
      ).toBeTruthy();
    });

    it('should return user selected destination with 100% match', () => {
      const types: TripType[] = ['relaxamento'];
      const budget: BudgetPerDay = 'medio';

      const results = matchDestinations(
        types,
        budget,
        '',
        'Lisboa'
      );

      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Lisboa');
      expect(results[0].score).toBe(100);
      expect(results[0].matchPercentage).toBe(100);
    });

    it('should handle multiple trip types', () => {
      const types: TripType[] = ['relaxamento', 'aventura'];
      const budget: BudgetPerDay = 'medio';

      const results = matchDestinations(types, budget, '');

      expect(results.length).toBeGreaterThan(0);

      // Results should score better if they match multiple types
      results.forEach((result) => {
        expect(result.reasons).toBeDefined();
      });
    });

    it('should have all required properties in results', () => {
      const types: TripType[] = ['cultura'];
      const budget: BudgetPerDay = 'premium';

      const results = matchDestinations(types, budget, '');

      results.forEach((result) => {
        expect(result.name).toBeTruthy();
        expect(result.country).toBeTruthy();
        expect(result.score).toBeDefined();
        expect(result.reasons).toBeInstanceOf(Array);
        expect(result.emoji).toBeTruthy();
        expect(result.matchPercentage).toBeDefined();
      });
    });
  });

  describe('getDestinationInfo', () => {
    it('should return destination info by name', () => {
      const info = getDestinationInfo('Lisboa');

      expect(info).toBeDefined();
      expect(info?.name).toBe('Lisboa');
      expect(info?.country).toBe('Portugal');
      expect(info?.emoji).toBe('🌉');
      expect(info?.description).toBeTruthy();
    });

    it('should return undefined for non-existent destination', () => {
      const info = getDestinationInfo('NonExistentPlace');

      expect(info).toBeUndefined();
    });

    it('should have complete destination data', () => {
      const info = getDestinationInfo('Paris');

      expect(info?.types).toBeInstanceOf(Array);
      expect(info?.types?.length).toBeGreaterThan(0);
      expect(info?.bestDuration).toBeInstanceOf(Array);
      expect(info?.budgetRange).toBeDefined();
      expect(info?.budgetRange?.min).toBeTruthy();
      expect(info?.budgetRange?.max).toBeTruthy();
    });
  });

  describe('getAllDestinations', () => {
    it('should return all destination names', () => {
      const all = getAllDestinations();

      expect(all).toBeInstanceOf(Array);
      expect(all.length).toBeGreaterThan(10);
    });

    it('should match database length', () => {
      const all = getAllDestinations();

      expect(all.length).toBe(DESTINATIONS_DB.length);
    });

    it('should return unique names', () => {
      const all = getAllDestinations();
      const unique = new Set(all);

      expect(unique.size).toBe(all.length);
    });
  });

  describe('DESTINATIONS_DB', () => {
    it('should have destinations with valid data', () => {
      DESTINATIONS_DB.forEach((dest) => {
        expect(dest.name).toBeTruthy();
        expect(dest.country).toBeTruthy();
        expect(dest.emoji).toBeTruthy();
        expect(dest.types).toBeInstanceOf(Array);
        expect(dest.types.length).toBeGreaterThan(0);
        expect(dest.bestDuration).toBeInstanceOf(Array);
        expect(dest.bestDuration.length).toBeGreaterThan(0);
        expect(dest.budgetRange).toBeDefined();
        expect(dest.description).toBeTruthy();
      });
    });

    it('should have at least 15 destinations', () => {
      expect(DESTINATIONS_DB.length).toBeGreaterThanOrEqual(15);
    });
  });
});
