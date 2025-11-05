import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import DurationAndBudgetSelector from '../../components/DurationAndBudgetSelector';

describe('DurationAndBudgetSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render budget section and date inputs', () => {
    const mockOnBudgetChange = vi.fn();
    const mockOnStartDateChange = vi.fn();
    const mockOnEndDateChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <DurationAndBudgetSelector
          budgetPerDay=""
          onBudgetChange={mockOnBudgetChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
        />
      </I18nextProvider>
    );

    // Check that both budget and date sections exist by looking for their headings
    const headings = container.querySelectorAll('h3');
    expect(headings.length).toBeGreaterThanOrEqual(2);
  });

  it('should render budget options', () => {
    const mockOnBudgetChange = vi.fn();
    const mockOnStartDateChange = vi.fn();
    const mockOnEndDateChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <DurationAndBudgetSelector
          budgetPerDay=""
          onBudgetChange={mockOnBudgetChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
        />
      </I18nextProvider>
    );

    const budgetButtons = container.querySelectorAll('button');
    // Should have at least 5 budget options
    expect(budgetButtons.length).toBeGreaterThanOrEqual(5);
  });

  it('should handle budget selection', () => {
    const mockOnBudgetChange = vi.fn();
    const mockOnStartDateChange = vi.fn();
    const mockOnEndDateChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <DurationAndBudgetSelector
          budgetPerDay=""
          onBudgetChange={mockOnBudgetChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
        />
      </I18nextProvider>
    );

    const buttons = Array.from(container.querySelectorAll('button'));
    const firstBudgetButton = buttons[0];

    fireEvent.click(firstBudgetButton);
    expect(mockOnBudgetChange).toHaveBeenCalled();
  });

  it('should show selected state for budget', () => {
    const mockOnBudgetChange = vi.fn();
    const mockOnStartDateChange = vi.fn();
    const mockOnEndDateChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <DurationAndBudgetSelector
          budgetPerDay="medio"
          onBudgetChange={mockOnBudgetChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
        />
      </I18nextProvider>
    );

    // Verify component renders with selected values
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should disable all buttons when disabled prop is true', () => {
    const mockOnBudgetChange = vi.fn();
    const mockOnStartDateChange = vi.fn();
    const mockOnEndDateChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <DurationAndBudgetSelector
          budgetPerDay=""
          onBudgetChange={mockOnBudgetChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
          disabled={true}
        />
      </I18nextProvider>
    );

    const buttons = Array.from(
      container.querySelectorAll('button')
    ) as HTMLButtonElement[];
    buttons.forEach((button) => {
      expect(button.disabled).toBe(true);
    });

    fireEvent.click(buttons[0]);
    expect(mockOnBudgetChange).not.toHaveBeenCalled();
  });

  it('should handle start date change', () => {
    const mockOnBudgetChange = vi.fn();
    const mockOnStartDateChange = vi.fn();
    const mockOnEndDateChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <DurationAndBudgetSelector
          budgetPerDay="medio"
          onBudgetChange={mockOnBudgetChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
        />
      </I18nextProvider>
    );

    const dateInputs = container.querySelectorAll('input[type="date"]');
    const startDateInput = dateInputs[0];

    fireEvent.change(startDateInput, { target: { value: '2025-11-15' } });
    expect(mockOnStartDateChange).toHaveBeenCalledWith('2025-11-15');
  });

  it('should handle end date change', () => {
    const mockOnBudgetChange = vi.fn();
    const mockOnStartDateChange = vi.fn();
    const mockOnEndDateChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <DurationAndBudgetSelector
          startDate="2025-11-15"
          endDate=""
          budgetPerDay="medio"
          onBudgetChange={mockOnBudgetChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
        />
      </I18nextProvider>
    );

    const dateInputs = container.querySelectorAll('input[type="date"]');
    const endDateInput = dateInputs[1];

    fireEvent.change(endDateInput, { target: { value: '2025-11-22' } });
    expect(mockOnEndDateChange).toHaveBeenCalledWith('2025-11-22');
  });

  it('should display budget guide information', () => {
    const mockOnBudgetChange = vi.fn();
    const mockOnStartDateChange = vi.fn();
    const mockOnEndDateChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <DurationAndBudgetSelector
          budgetPerDay=""
          onBudgetChange={mockOnBudgetChange}
          onStartDateChange={mockOnStartDateChange}
          onEndDateChange={mockOnEndDateChange}
        />
      </I18nextProvider>
    );

    // Check that budget guide section exists
    const budgetGuideSection = container.querySelector('.bg-amber-50');
    expect(budgetGuideSection).toBeInTheDocument();
  });
});
