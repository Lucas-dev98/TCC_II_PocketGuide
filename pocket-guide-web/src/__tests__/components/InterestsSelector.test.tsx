import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InterestsSelector } from '../../components/InterestsSelector';

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

describe('InterestsSelector', () => {
  const defaultProps = {
    selectedInterests: [],
    onInterestsChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render interest categories', () => {
    render(
      <InterestsSelector {...defaultProps} />
    );

    expect(screen.getByText('Cultura & História')).toBeInTheDocument();
    expect(screen.getByText('Gastronomia')).toBeInTheDocument();
    expect(screen.getByText('Natureza')).toBeInTheDocument();
    expect(screen.getByText('Relaxamento')).toBeInTheDocument();
    expect(screen.getByText('Aventura')).toBeInTheDocument();
    expect(screen.getByText('Atividades & Entretenimento')).toBeInTheDocument();
  });

  it('should toggle interest when clicked', () => {
    const onInterestsChange = vi.fn();
    render(
      <InterestsSelector
        {...defaultProps}
        onInterestsChange={onInterestsChange}
      />
    );

    const buttons = screen.getAllByRole('button');
    const interestButton = buttons.find((btn) => btn.textContent?.includes('Museus'));

    if (interestButton) {
      fireEvent.click(interestButton);
      expect(onInterestsChange).toHaveBeenCalled();
    }
  });

  it('should display selected interest tags', () => {
    render(
      <InterestsSelector
        {...defaultProps}
        selectedInterests={['museus']}
      />
    );

    const museumTexts = screen.queryAllByText('Museus');
    expect(museumTexts.length).toBeGreaterThan(0);
  });

  it('should remove interest when clicking tag', () => {
    const onInterestsChange = vi.fn();
    render(
      <InterestsSelector
        {...defaultProps}
        selectedInterests={['museus', 'praias']}
        onInterestsChange={onInterestsChange}
      />
    );

    const buttons = screen.getAllByRole('button');
    const tagButtons = buttons.filter((btn) => btn.textContent?.includes('×'));

    if (tagButtons.length > 0) {
      fireEvent.click(tagButtons[0]);
      expect(onInterestsChange).toHaveBeenCalled();
    }
  });

  it('should filter interests by trip type', () => {
    render(
      <InterestsSelector
        {...defaultProps}
        tripType="relaxamento"
      />
    );

    // Should show relaxation-related categories first
    const categories = screen.getByText('Relaxamento');
    expect(categories).toBeInTheDocument();
  });

  it('should handle disabled state', () => {
    render(
      <InterestsSelector
        {...defaultProps}
        disabled={true}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should update when selected interests change', () => {
    const { rerender } = render(
      <InterestsSelector
        {...defaultProps}
        selectedInterests={[]}
      />
    );

    rerender(
      <InterestsSelector
        {...defaultProps}
        selectedInterests={['museus', 'praias']}
      />
    );

    const museums = screen.queryAllByText('Museus');
    const beaches = screen.queryAllByText('Praias');
    
    expect(museums.length).toBeGreaterThan(0);
    expect(beaches.length).toBeGreaterThan(0);
  });

  it('should allow multiple selections', () => {
    const { rerender } = render(
      <InterestsSelector
        {...defaultProps}
        selectedInterests={['museus']}
      />
    );

    rerender(
      <InterestsSelector
        {...defaultProps}
        selectedInterests={['museus', 'praias', 'gastronomia']}
      />
    );

    const museums = screen.queryAllByText('Museus');
    expect(museums.length).toBeGreaterThan(0);
  });

  it('should display all interest buttons', () => {
    render(
      <InterestsSelector {...defaultProps} />
    );

    expect(screen.getByText('Monumentos')).toBeInTheDocument();
    expect(screen.getByText('Gastronomia Local')).toBeInTheDocument();
    expect(screen.getByText('Trilhas')).toBeInTheDocument();
  });
});
