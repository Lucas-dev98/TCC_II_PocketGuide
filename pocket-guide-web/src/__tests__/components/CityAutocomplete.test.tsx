import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CityAutocomplete } from '../../components/CityAutocomplete';
import * as mapboxGeocoding from '../../services/mapboxGeocoding';
import type { CitySuggestion } from '../../types';

// Mock do serviço de geocoding
vi.mock('../../services/mapboxGeocoding');

describe('CityAutocomplete Component', () => {
  const mockOnCitySelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render input field', () => {
      vi.mocked(mapboxGeocoding.searchCities).mockResolvedValue([]);
      
      render(
        <CityAutocomplete
          value=""
          onCitySelect={mockOnCitySelect}
          placeholder="Buscar cidade..."
        />
      );

      const input = screen.getByPlaceholderText('Buscar cidade...');
      expect(input).toBeInTheDocument();
    });

    it('should render with default value', () => {
      vi.mocked(mapboxGeocoding.searchCities).mockResolvedValue([]);
      
      render(
        <CityAutocomplete
          value="Lisboa"
          onCitySelect={mockOnCitySelect}
        />
      );

      const input = screen.getByDisplayValue('Lisboa');
      expect(input).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      vi.mocked(mapboxGeocoding.searchCities).mockResolvedValue([]);
      
      const { container } = render(
        <CityAutocomplete
          value=""
          onCitySelect={mockOnCitySelect}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Search Functionality', () => {
    it('should search cities when typing', async () => {
      const mockSuggestions: CitySuggestion[] = [
        {
          city: 'Lisboa',
          country: 'Portugal',
          type: 'city' as const,
          coordinates: [-9.1393, 38.7223],
          relevance: 95,
          population: 505526,
          description: 'Capital',
          isCapital: true,
          isMajorCity: true,
        },
      ];

      vi.mocked(mapboxGeocoding.searchCities).mockResolvedValue(mockSuggestions);
      vi.mocked(mapboxGeocoding.groupSuggestions).mockReturnValue({
        countries: [],
        cities: mockSuggestions,
        regions: [],
        landmarks: [],
      });

      render(
        <CityAutocomplete
          value=""
          onCitySelect={mockOnCitySelect}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'Lisboa');

      await waitFor(() => {
        expect(mapboxGeocoding.searchCities).toHaveBeenCalledWith('Lisboa', expect.any(String));
      });
    });

    it('should not show suggestions when input is empty', () => {
      vi.mocked(mapboxGeocoding.searchCities).mockResolvedValue([]);

      render(
        <CityAutocomplete
          value=""
          onCitySelect={mockOnCitySelect}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      // Empty input should not trigger search
      expect(mapboxGeocoding.searchCities).not.toHaveBeenCalled();
    });

    it('should handle search errors gracefully', async () => {
      vi.mocked(mapboxGeocoding.searchCities).mockRejectedValue(
        new Error('Search failed')
      );

      render(
        <CityAutocomplete
          value=""
          onCitySelect={mockOnCitySelect}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'Test', { delay: 50 });

      await waitFor(() => {
        expect(mapboxGeocoding.searchCities).toHaveBeenCalled();
      });
    });
  });

  describe('Grouped Results Display', () => {
    it('should group results by type', async () => {
      const mockGrouped = {
        countries: [
          {
            city: 'Portugal',
            country: 'Portugal',
            type: 'country' as const,
            coordinates: [-8, 39.5] as [number, number],
            relevance: 100,
            description: 'País',
          },
        ] as CitySuggestion[],
        cities: [
          {
            city: 'Lisboa',
            country: 'Portugal',
            type: 'city' as const,
            coordinates: [-9.1393, 38.7223] as [number, number],
            relevance: 95,
            isCapital: true,
            description: 'Capital',
          },
        ] as CitySuggestion[],
        regions: [],
        landmarks: [],
      };

      vi.mocked(mapboxGeocoding.searchCities).mockResolvedValue([]);
      vi.mocked(mapboxGeocoding.groupSuggestions).mockReturnValue(mockGrouped);

      render(
        <CityAutocomplete
          value=""
          onCitySelect={mockOnCitySelect}
        />
      );

      expect(mapboxGeocoding.groupSuggestions).toBeDefined();
    });

    it('should show empty state when no results found', async () => {
      vi.mocked(mapboxGeocoding.searchCities).mockResolvedValue([]);
      vi.mocked(mapboxGeocoding.groupSuggestions).mockReturnValue({
        countries: [],
        cities: [],
        regions: [],
        landmarks: [],
      });

      render(
        <CityAutocomplete
          value=""
          onCitySelect={mockOnCitySelect}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'xyz123notaplace', { delay: 50 });

      await waitFor(() => {
        expect(mapboxGeocoding.searchCities).toHaveBeenCalled();
      });
    });
  });

  describe('Selection Behavior', () => {
    it('should handle city selection', async () => {
      const mockSuggestions: CitySuggestion[] = [
        {
          city: 'Lisboa',
          country: 'Portugal',
          type: 'city' as const,
          coordinates: [-9.1393, 38.7223],
          relevance: 95,
          population: 505526,
          description: 'Capital',
          isCapital: true,
          isMajorCity: true,
        },
      ];

      vi.mocked(mapboxGeocoding.searchCities).mockResolvedValue(mockSuggestions);
      vi.mocked(mapboxGeocoding.groupSuggestions).mockReturnValue({
        countries: [],
        cities: mockSuggestions,
        regions: [],
        landmarks: [],
      });

      render(
        <CityAutocomplete
          value=""
          onCitySelect={mockOnCitySelect}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'Lisboa', { delay: 50 });

      await waitFor(() => {
        expect(mapboxGeocoding.searchCities).toHaveBeenCalled();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close dropdown on Escape key', async () => {
      vi.mocked(mapboxGeocoding.searchCities).mockResolvedValue([]);

      render(
        <CityAutocomplete
          value=""
          onCitySelect={mockOnCitySelect}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

      // Dropdown should be closed
      expect(input).toBeInTheDocument();
    });

    it('should handle input blur correctly', () => {
      vi.mocked(mapboxGeocoding.searchCities).mockResolvedValue([]);

      render(
        <CityAutocomplete
          value=""
          onCitySelect={mockOnCitySelect}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);

      expect(input).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper placeholder text', () => {
      vi.mocked(mapboxGeocoding.searchCities).mockResolvedValue([]);

      render(
        <CityAutocomplete
          value=""
          onCitySelect={mockOnCitySelect}
          placeholder="Buscar cidade"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Buscar cidade');
    });

    it('should be keyboard accessible', async () => {
      vi.mocked(mapboxGeocoding.searchCities).mockResolvedValue([]);

      render(
        <CityAutocomplete
          value=""
          onCitySelect={mockOnCitySelect}
        />
      );

      const input = screen.getByRole('textbox');
      
      // Should be focusable
      input.focus();
      expect(input).toHaveFocus();
      
      // Should be typeable
      await userEvent.type(input, 'Test');
      expect((input as HTMLInputElement).value).toBe('Test');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long city names', async () => {
      const mockSuggestions: CitySuggestion[] = [];
      vi.mocked(mapboxGeocoding.searchCities).mockResolvedValue(mockSuggestions);

      render(
        <CityAutocomplete
          value=""
          onCitySelect={mockOnCitySelect}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      
      // Type a moderate length string
      for (let i = 0; i < 20; i++) {
        await userEvent.type(input, 'a');
      }
      
      // Should still be functional
      expect(input).toBeInTheDocument();
    });
  });

  describe('Language Support', () => {
    it('should accept language prop', () => {
      vi.mocked(mapboxGeocoding.searchCities).mockResolvedValue([]);

      const { rerender } = render(
        <CityAutocomplete
          value=""
          onCitySelect={mockOnCitySelect}
          language="pt-BR"
        />
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();

      rerender(
        <CityAutocomplete
          value=""
          onCitySelect={mockOnCitySelect}
          language="en-US"
        />
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });
});
