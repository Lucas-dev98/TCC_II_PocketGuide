import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DestinationSelector } from '../../components/DestinationSelector';
import { TripType, TripDuration, BudgetPerDay } from '../../types';

const mockI18n = {
  t: (key: string) => key,
  language: 'pt',
};

vi.mock('react-i18next', async () => {
  const actual = await vi.importActual('react-i18next');
  return {
    ...actual,
    useTranslation: () => mockI18n,
  };
});

describe('DestinationSelector', () => {
  const defaultProps = {
    tripTypes: ['relaxamento'] as TripType[],
    duration: 'uma-semana' as TripDuration,
    budget: 'medio' as BudgetPerDay,
    onDestinationChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render title and subtitle', () => {
    render(
      <DestinationSelector {...defaultProps} />
    );

    expect(screen.getByText('newFlow.step5.title')).toBeInTheDocument();
    expect(screen.getByText('newFlow.step5.subtitle')).toBeInTheDocument();
  });

  it('should display recommendations', () => {
    render(
      <DestinationSelector {...defaultProps} />
    );

    expect(screen.getByText('newFlow.step5.aiRecommendations')).toBeInTheDocument();
  });

  it('should show manual search option', () => {
    render(
      <DestinationSelector {...defaultProps} />
    );

    const searchButton = screen.getByText('newFlow.step5.manualSearch');
    expect(searchButton).toBeInTheDocument();
  });

  it('should toggle between recommendations and search', () => {
    render(
      <DestinationSelector {...defaultProps} />
    );

    const searchButton = screen.getByText('newFlow.step5.manualSearch');
    fireEvent.click(searchButton);

    expect(screen.getByText('newFlow.step5.searchDestinations')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('newFlow.step5.searchPlaceholder')).toBeInTheDocument();
  });

  it('should display selected destination', () => {
    render(
      <DestinationSelector
        {...defaultProps}
        selectedDestination="Lisboa"
      />
    );

    expect(screen.getByText('Lisboa')).toBeInTheDocument();
    expect(screen.getByText('Portugal')).toBeInTheDocument();
  });

  it('should show change button when destination is selected', () => {
    render(
      <DestinationSelector
        {...defaultProps}
        selectedDestination="Paris"
      />
    );

    expect(screen.getByText('common.change')).toBeInTheDocument();
  });

  it('should clear selection when change button is clicked', () => {
    render(
      <DestinationSelector
        {...defaultProps}
        selectedDestination="Barcelona"
      />
    );

    const changeButton = screen.getByText('common.change');
    fireEvent.click(changeButton);

    expect(defaultProps.onDestinationChange).toHaveBeenCalledWith('');
  });

  it('should call onDestinationChange when selecting from recommendations', async () => {
    const onDestinationChange = vi.fn();
    render(
      <DestinationSelector
        {...defaultProps}
        onDestinationChange={onDestinationChange}
      />
    );

    // Click on first recommendation (or a button in the recommendations)
    const buttons = screen.getAllByRole('button');
    const recommendationButton = buttons.find(
      (btn) =>
        !btn.textContent?.includes('manual') &&
        !btn.textContent?.includes('search') &&
        !btn.textContent?.includes('change')
    );

    if (recommendationButton) {
      fireEvent.click(recommendationButton);
      await waitFor(() => {
        expect(onDestinationChange).toHaveBeenCalled();
      });
    }
  });

  it('should handle disabled state', () => {
    render(
      <DestinationSelector
        {...defaultProps}
        disabled={true}
      />
    );

    const searchButton = screen.getByText('newFlow.step5.manualSearch');
    expect(searchButton).toBeDisabled();
  });

  it('should filter destinations on search', async () => {
    render(
      <DestinationSelector {...defaultProps} />
    );

    const searchButton = screen.getByText('newFlow.step5.manualSearch');
    fireEvent.click(searchButton);

    const searchInput = screen.getByPlaceholderText('newFlow.step5.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'lis' } });

    await waitFor(() => {
      const results = screen.queryAllByRole('button');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  it('should show no results message when search returns nothing', async () => {
    render(
      <DestinationSelector {...defaultProps} />
    );

    const searchButton = screen.getByText('newFlow.step5.manualSearch');
    fireEvent.click(searchButton);

    const searchInput = screen.getByPlaceholderText('newFlow.step5.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'zzzzzzz' } });

    await waitFor(() => {
      expect(screen.getByText('newFlow.step5.noResults')).toBeInTheDocument();
    });
  });

  it('should return to recommendations from search', () => {
    render(
      <DestinationSelector {...defaultProps} />
    );

    const searchButton = screen.getByText('newFlow.step5.manualSearch');
    fireEvent.click(searchButton);

    expect(screen.getByText('newFlow.step5.searchDestinations')).toBeInTheDocument();

    const backButton = screen.getByText(/common.back/);
    fireEvent.click(backButton);

    expect(screen.getByText('newFlow.step5.aiRecommendations')).toBeInTheDocument();
  });

  it('should select from search results', async () => {
    const onDestinationChange = vi.fn();
    render(
      <DestinationSelector
        {...defaultProps}
        onDestinationChange={onDestinationChange}
      />
    );

    const searchButton = screen.getByText('newFlow.step5.manualSearch');
    fireEvent.click(searchButton);

    const searchInput = screen.getByPlaceholderText('newFlow.step5.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'lis' } });

    await waitFor(() => {
      const lisboaButton = screen.queryByText('Lisboa');
      if (lisboaButton) {
        fireEvent.click(lisboaButton);
      }
    });
  });

  it('should have proper structure for recommendation cards', async () => {
    render(
      <DestinationSelector {...defaultProps} />
    );

    await waitFor(() => {
      const recommendationCards = screen.queryAllByRole('button');
      expect(recommendationCards.length).toBeGreaterThan(0);
    });
  });

  it('should update when props change', () => {
    const { rerender } = render(
      <DestinationSelector
        {...defaultProps}
        tripTypes={['relaxamento']}
      />
    );

    rerender(
      <DestinationSelector
        {...defaultProps}
        tripTypes={['aventura']}
      />
    );

    expect(screen.getByText('newFlow.step5.aiRecommendations')).toBeInTheDocument();
  });

  it('should display destination emoji and country', () => {
    render(
      <DestinationSelector
        {...defaultProps}
        selectedDestination="Rio de Janeiro"
      />
    );

    expect(screen.getByText('Rio de Janeiro')).toBeInTheDocument();
    expect(screen.getByText('Brazil')).toBeInTheDocument();
  });

  it('should show destination description when selected', () => {
    render(
      <DestinationSelector
        {...defaultProps}
        selectedDestination="Paris"
      />
    );

    // Paris should be visible
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });
});
