import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import SeasonalSelector from '../../components/SeasonalSelector';

describe('SeasonalSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render month selection calendar', () => {
    const mockOnMonthChange = vi.fn();
    const mockOnYearChange = vi.fn();
    const currentYear = new Date().getFullYear();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <SeasonalSelector
          destination="Lisboa"
          selectedMonth=""
          selectedYear={currentYear}
          onMonthChange={mockOnMonthChange}
          onYearChange={mockOnYearChange}
        />
      </I18nextProvider>
    );

    // Should display month abbreviations
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(container.textContent).toContain('Dez');
  });

  it('should render year selection buttons', () => {
    const mockOnMonthChange = vi.fn();
    const mockOnYearChange = vi.fn();
    const currentYear = new Date().getFullYear();

    render(
      <I18nextProvider i18n={i18n}>
        <SeasonalSelector
          destination="Lisboa"
          selectedMonth=""
          selectedYear={currentYear}
          onMonthChange={mockOnMonthChange}
          onYearChange={mockOnYearChange}
        />
      </I18nextProvider>
    );

    // Should display next 5 years
    expect(screen.getByText(currentYear.toString())).toBeInTheDocument();
    expect(screen.getByText((currentYear + 4).toString())).toBeInTheDocument();
  });

  it('should handle month selection', () => {
    const mockOnMonthChange = vi.fn();
    const mockOnYearChange = vi.fn();
    const currentYear = new Date().getFullYear();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <SeasonalSelector
          destination="Lisboa"
          selectedMonth=""
          selectedYear={currentYear}
          onMonthChange={mockOnMonthChange}
          onYearChange={mockOnYearChange}
        />
      </I18nextProvider>
    );

    const monthButtons = Array.from(container.querySelectorAll('button')).filter(
      (btn) => btn.textContent?.includes('Jan') || btn.textContent?.includes('Feb')
    );

    if (monthButtons.length > 0) {
      fireEvent.click(monthButtons[0]);
      expect(mockOnMonthChange).toHaveBeenCalled();
    }
  });

  it('should handle year selection', () => {
    const mockOnMonthChange = vi.fn();
    const mockOnYearChange = vi.fn();
    const currentYear = new Date().getFullYear();

    render(
      <I18nextProvider i18n={i18n}>
        <SeasonalSelector
          destination="Lisboa"
          selectedMonth=""
          selectedYear={currentYear}
          onMonthChange={mockOnMonthChange}
          onYearChange={mockOnYearChange}
        />
      </I18nextProvider>
    );

    const nextYearButton = screen.getByText((currentYear + 1).toString());
    fireEvent.click(nextYearButton);

    expect(mockOnYearChange).toHaveBeenCalledWith(currentYear + 1);
  });

  it('should show destination info box', () => {
    const mockOnMonthChange = vi.fn();
    const mockOnYearChange = vi.fn();
    const currentYear = new Date().getFullYear();

    render(
      <I18nextProvider i18n={i18n}>
        <SeasonalSelector
          destination="Roma"
          selectedMonth=""
          selectedYear={currentYear}
          onMonthChange={mockOnMonthChange}
          onYearChange={mockOnYearChange}
        />
      </I18nextProvider>
    );

    // Should show destination name
    expect(screen.getByText('Roma')).toBeInTheDocument();
  });

  it('should show month details when month is selected', () => {
    const mockOnMonthChange = vi.fn();
    const mockOnYearChange = vi.fn();
    const currentYear = new Date().getFullYear();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <SeasonalSelector
          destination="Lisboa"
          selectedMonth={5}
          selectedYear={currentYear}
          onMonthChange={mockOnMonthChange}
          onYearChange={mockOnYearChange}
        />
      </I18nextProvider>
    );

    // Should show selected date info
    const detailsBox = container.querySelector('.bg-indigo-50');
    expect(detailsBox).toBeInTheDocument();
  });

  it('should show legend with status indicators', () => {
    const mockOnMonthChange = vi.fn();
    const mockOnYearChange = vi.fn();
    const currentYear = new Date().getFullYear();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <SeasonalSelector
          destination="Lisboa"
          selectedMonth=""
          selectedYear={currentYear}
          onMonthChange={mockOnMonthChange}
          onYearChange={mockOnYearChange}
        />
      </I18nextProvider>
    );

    // Should show status emojis in the container
    expect(container.textContent).toContain('✅');
    expect(container.textContent).toContain('⚠️');
    expect(container.textContent).toContain('❌');
  });

  it('should disable all buttons when disabled prop is true', () => {
    const mockOnMonthChange = vi.fn();
    const mockOnYearChange = vi.fn();
    const currentYear = new Date().getFullYear();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <SeasonalSelector
          destination="Lisboa"
          selectedMonth=""
          selectedYear={currentYear}
          onMonthChange={mockOnMonthChange}
          onYearChange={mockOnYearChange}
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
    expect(mockOnMonthChange).not.toHaveBeenCalled();
  });

  it('should show selected month with ring style', () => {
    const mockOnMonthChange = vi.fn();
    const mockOnYearChange = vi.fn();
    const currentYear = new Date().getFullYear();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <SeasonalSelector
          destination="Lisboa"
          selectedMonth={4}
          selectedYear={currentYear}
          onMonthChange={mockOnMonthChange}
          onYearChange={mockOnYearChange}
        />
      </I18nextProvider>
    );

    const monthButtons = Array.from(container.querySelectorAll('button')).filter(
      (btn) => btn.textContent?.includes('Abr') || btn.textContent?.includes('Apr')
    );

    if (monthButtons.length > 0) {
      expect(monthButtons[0].className).toContain('ring-2');
    }
  });

  it('should show selected year with purple styling', () => {
    const mockOnMonthChange = vi.fn();
    const mockOnYearChange = vi.fn();
    const currentYear = new Date().getFullYear();

    render(
      <I18nextProvider i18n={i18n}>
        <SeasonalSelector
          destination="Lisboa"
          selectedMonth=""
          selectedYear={currentYear + 1}
          onMonthChange={mockOnMonthChange}
          onYearChange={mockOnYearChange}
        />
      </I18nextProvider>
    );

    const yearButton = screen.getByText((currentYear + 1).toString());
    expect(yearButton.className).toContain('border-purple-500');
  });
});
