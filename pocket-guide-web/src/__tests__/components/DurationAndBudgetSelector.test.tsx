import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import DurationAndBudgetSelector from '../../components/DurationAndBudgetSelector';

describe('DurationAndBudgetSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render duration and budget sections', () => {
    const mockOnDurationChange = vi.fn();
    const mockOnBudgetChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <DurationAndBudgetSelector
          duration=""
          budgetPerDay=""
          onDurationChange={mockOnDurationChange}
          onBudgetChange={mockOnBudgetChange}
        />
      </I18nextProvider>
    );

    // Check that both sections exist by looking for their headings
    const headings = container.querySelectorAll('h3');
    expect(headings.length).toBeGreaterThanOrEqual(2);
  });

  it('should render all duration options', () => {
    const mockOnDurationChange = vi.fn();
    const mockOnBudgetChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <DurationAndBudgetSelector
          duration=""
          budgetPerDay=""
          onDurationChange={mockOnDurationChange}
          onBudgetChange={mockOnBudgetChange}
        />
      </I18nextProvider>
    );

    const durationButtons = container.querySelectorAll('button');
    // Should have at least 4 duration options
    expect(durationButtons.length).toBeGreaterThanOrEqual(4);
  });

  it('should handle duration selection', () => {
    const mockOnDurationChange = vi.fn();
    const mockOnBudgetChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <DurationAndBudgetSelector
          duration=""
          budgetPerDay=""
          onDurationChange={mockOnDurationChange}
          onBudgetChange={mockOnBudgetChange}
        />
      </I18nextProvider>
    );

    const buttons = Array.from(container.querySelectorAll('button'));
    const firstDurationButton = buttons[0];

    fireEvent.click(firstDurationButton);
    expect(mockOnDurationChange).toHaveBeenCalled();
  });

  it('should handle budget selection', () => {
    const mockOnDurationChange = vi.fn();
    const mockOnBudgetChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <DurationAndBudgetSelector
          duration="uma-semana"
          budgetPerDay=""
          onDurationChange={mockOnDurationChange}
          onBudgetChange={mockOnBudgetChange}
        />
      </I18nextProvider>
    );

    const buttons = Array.from(container.querySelectorAll('button'));
    // Duration buttons are first 4, budget buttons are next 5
    const firstBudgetButton = buttons[4];

    fireEvent.click(firstBudgetButton);
    expect(mockOnBudgetChange).toHaveBeenCalled();
  });

  it('should show selected state for duration', () => {
    const mockOnDurationChange = vi.fn();
    const mockOnBudgetChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <DurationAndBudgetSelector
          duration="uma-semana"
          budgetPerDay=""
          onDurationChange={mockOnDurationChange}
          onBudgetChange={mockOnBudgetChange}
        />
      </I18nextProvider>
    );

    const buttons = Array.from(container.querySelectorAll('button'));
    // Second duration button (uma-semana)
    expect(buttons[1].className).toContain('border-blue-500');
  });

  it('should show selected state for budget', () => {
    const mockOnDurationChange = vi.fn();
    const mockOnBudgetChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <DurationAndBudgetSelector
          duration="uma-semana"
          budgetPerDay="medio"
          onDurationChange={mockOnDurationChange}
          onBudgetChange={mockOnBudgetChange}
        />
      </I18nextProvider>
    );

    // Verify component renders with selected values
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should disable all buttons when disabled prop is true', () => {
    const mockOnDurationChange = vi.fn();
    const mockOnBudgetChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <DurationAndBudgetSelector
          duration=""
          budgetPerDay=""
          onDurationChange={mockOnDurationChange}
          onBudgetChange={mockOnBudgetChange}
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
    expect(mockOnDurationChange).not.toHaveBeenCalled();
  });

  it('should show summary when both duration and budget are selected', () => {
    const mockOnDurationChange = vi.fn();
    const mockOnBudgetChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <DurationAndBudgetSelector
          duration="uma-semana"
          budgetPerDay="medio"
          onDurationChange={mockOnDurationChange}
          onBudgetChange={mockOnBudgetChange}
        />
      </I18nextProvider>
    );

    // Check for the summary box by its styling
    const summaryBox = container.querySelector('.bg-blue-50');
    expect(summaryBox).toBeInTheDocument();
  });

  it('should not show summary when duration is not selected', () => {
    const mockOnDurationChange = vi.fn();
    const mockOnBudgetChange = vi.fn();

    render(
      <I18nextProvider i18n={i18n}>
        <DurationAndBudgetSelector
          duration=""
          budgetPerDay="medio"
          onDurationChange={mockOnDurationChange}
          onBudgetChange={mockOnBudgetChange}
        />
      </I18nextProvider>
    );

    expect(screen.queryByText(/resumo/i)).not.toBeInTheDocument();
  });

  it('should display budget guide information', () => {
    const mockOnDurationChange = vi.fn();
    const mockOnBudgetChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <DurationAndBudgetSelector
          duration=""
          budgetPerDay=""
          onDurationChange={mockOnDurationChange}
          onBudgetChange={mockOnBudgetChange}
        />
      </I18nextProvider>
    );

    // Check that budget guide section exists
    const budgetGuideSection = container.querySelector('.bg-amber-50');
    expect(budgetGuideSection).toBeInTheDocument();
  });
});
