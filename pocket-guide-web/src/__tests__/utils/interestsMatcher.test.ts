import { describe, it, expect } from 'vitest';
import {
  getRecommendedInterests,
  getAllInterestCategories,
  getInterestById,
  getInterestsByIds,
  getInterestCategory,
  validateInterests,
  ALL_INTERESTS,
  INTERESTS_BY_CATEGORY,
} from '../../utils/interestsMatcher';

describe('interestsMatcher', () => {
  describe('getRecommendedInterests', () => {
    it('should return recommended interests for relaxamento', () => {
      const interests = getRecommendedInterests('relaxamento');

      expect(interests).toHaveLength(4);
      expect(interests[0].name).toBe('Relaxamento');
      expect(interests[1].name).toBe('Gastronomia');
    });

    it('should return recommended interests for aventura', () => {
      const interests = getRecommendedInterests('aventura');

      expect(interests).toHaveLength(4);
      expect(interests[0].name).toBe('Aventura');
      expect(interests[1].name).toBe('Natureza');
    });

    it('should return recommended interests for cultura', () => {
      const interests = getRecommendedInterests('cultura');

      expect(interests).toHaveLength(4);
      expect(interests[0].name).toBe('Cultura & História');
    });

    it('should return recommended interests for diversao', () => {
      const interests = getRecommendedInterests('diversao');

      expect(interests).toHaveLength(4);
      expect(interests[0].name).toBe('Atividades & Entretenimento');
    });

    it('should return recommended interests for exploracao', () => {
      const interests = getRecommendedInterests('exploracao');

      expect(interests).toHaveLength(4);
      expect(interests[0].name).toBe('Natureza');
    });

    it('should return recommended interests for romantica', () => {
      const interests = getRecommendedInterests('romantica');

      expect(interests).toHaveLength(4);
      expect(interests[0].name).toBe('Gastronomia');
    });

    it('should return different order for different trip types', () => {
      const relaxamento = getRecommendedInterests('relaxamento');
      const aventura = getRecommendedInterests('aventura');

      expect(relaxamento[0].name).not.toBe(aventura[0].name);
    });
  });

  describe('getAllInterestCategories', () => {
    it('should return all categories', () => {
      const categories = getAllInterestCategories();

      expect(categories).toHaveLength(6);
      expect(categories.map((c) => c.name)).toContain('Cultura & História');
      expect(categories.map((c) => c.name)).toContain('Gastronomia');
      expect(categories.map((c) => c.name)).toContain('Natureza');
      expect(categories.map((c) => c.name)).toContain('Relaxamento');
      expect(categories.map((c) => c.name)).toContain('Aventura');
      expect(categories.map((c) => c.name)).toContain('Atividades & Entretenimento');
    });

    it('should have interests in each category', () => {
      const categories = getAllInterestCategories();

      categories.forEach((category) => {
        expect(category.interests.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getInterestById', () => {
    it('should return interest by ID', () => {
      const interest = getInterestById('museus');

      expect(interest).toBeDefined();
      expect(interest?.label).toBe('Museus');
      expect(interest?.emoji).toBe('🏛️');
    });

    it('should return undefined for non-existent ID', () => {
      const interest = getInterestById('non-existent');

      expect(interest).toBeUndefined();
    });

    it('should handle various interest IDs', () => {
      const testIds = [
        'museus',
        'praias',
        'gastronomia',
        'spa',
        'escalada',
      ];

      testIds.forEach((id) => {
        const interest = getInterestById(id);
        expect(interest).toBeDefined();
        expect(interest?.id).toBe(id);
      });
    });
  });

  describe('getInterestsByIds', () => {
    it('should return multiple interests by IDs', () => {
      const interests = getInterestsByIds(['museus', 'praias', 'gastronomia']);

      expect(interests).toHaveLength(3);
      expect(interests[0].id).toBe('museus');
      expect(interests[1].id).toBe('praias');
      expect(interests[2].id).toBe('gastronomia');
    });

    it('should skip non-existent IDs', () => {
      const interests = getInterestsByIds([
        'museus',
        'non-existent',
        'praias',
      ]);

      expect(interests).toHaveLength(2);
      expect(interests[0].id).toBe('museus');
      expect(interests[1].id).toBe('praias');
    });

    it('should return empty array for no valid IDs', () => {
      const interests = getInterestsByIds(['non-existent-1', 'non-existent-2']);

      expect(interests).toHaveLength(0);
    });

    it('should handle empty input', () => {
      const interests = getInterestsByIds([]);

      expect(interests).toHaveLength(0);
    });
  });

  describe('getInterestCategory', () => {
    it('should return culture category', () => {
      const category = getInterestCategory('culture');

      expect(category?.name).toBe('Cultura & História');
      expect(category?.interests.length).toBeGreaterThan(0);
    });

    it('should return dining category', () => {
      const category = getInterestCategory('dining');

      expect(category?.name).toBe('Gastronomia');
    });

    it('should return nature category', () => {
      const category = getInterestCategory('nature');

      expect(category?.name).toBe('Natureza');
    });

    it('should return all valid categories', () => {
      const keys = ['culture', 'dining', 'nature', 'relaxation', 'adventure', 'activities'];

      keys.forEach((key) => {
        const category = getInterestCategory(
          key as 'culture' | 'dining' | 'nature' | 'relaxation' | 'adventure' | 'activities'
        );
        expect(category).toBeDefined();
        expect(category?.interests.length).toBeGreaterThan(0);
      });
    });
  });

  describe('validateInterests', () => {
    it('should validate valid interest IDs', () => {
      const isValid = validateInterests(['museus', 'praias', 'gastronomia']);

      expect(isValid).toBe(true);
    });

    it('should reject invalid interest IDs', () => {
      const isValid = validateInterests(['museus', 'non-existent']);

      expect(isValid).toBe(false);
    });

    it('should validate empty array', () => {
      const isValid = validateInterests([]);

      expect(isValid).toBe(true);
    });

    it('should handle single valid ID', () => {
      const isValid = validateInterests(['museus']);

      expect(isValid).toBe(true);
    });

    it('should handle single invalid ID', () => {
      const isValid = validateInterests(['non-existent']);

      expect(isValid).toBe(false);
    });
  });

  describe('ALL_INTERESTS', () => {
    it('should have valid structure', () => {
      ALL_INTERESTS.forEach((interest) => {
        expect(interest.id).toBeTruthy();
        expect(interest.label).toBeTruthy();
        expect(interest.emoji).toBeTruthy();
        expect(interest.category).toBeTruthy();
      });
    });

    it('should have at least 20 interests', () => {
      expect(ALL_INTERESTS.length).toBeGreaterThanOrEqual(20);
    });

    it('should have unique IDs', () => {
      const ids = ALL_INTERESTS.map((i) => i.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have interests distributed across categories', () => {
      const categories = new Set(ALL_INTERESTS.map((i) => i.category));

      expect(categories.size).toBeGreaterThan(3);
    });
  });

  describe('INTERESTS_BY_CATEGORY', () => {
    it('should have all categories defined', () => {
      expect(INTERESTS_BY_CATEGORY['culture']).toBeDefined();
      expect(INTERESTS_BY_CATEGORY['dining']).toBeDefined();
      expect(INTERESTS_BY_CATEGORY['nature']).toBeDefined();
      expect(INTERESTS_BY_CATEGORY['relaxation']).toBeDefined();
      expect(INTERESTS_BY_CATEGORY['adventure']).toBeDefined();
      expect(INTERESTS_BY_CATEGORY['activities']).toBeDefined();
    });

    it('each category should have interests', () => {
      Object.values(INTERESTS_BY_CATEGORY).forEach((category) => {
        expect(category.interests.length).toBeGreaterThan(0);
      });
    });
  });
});
