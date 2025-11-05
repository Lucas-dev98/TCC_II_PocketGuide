import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import TravelTypeSelector from '../../components/TravelTypeSelector';

describe('TravelTypeSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all travel type options', () => {
    const mockOnChange = vi.fn();
    render(
      <I18nextProvider i18n={i18n}>
        <TravelTypeSelector selected={[]} onChange={mockOnChange} />
      </I18nextProvider>
    );

    expect(screen.getByText('🏖️')).toBeInTheDocument();
    expect(screen.getByText('🏔️')).toBeInTheDocument();
    expect(screen.getByText('🎨')).toBeInTheDocument();
    expect(screen.getByText('🎉')).toBeInTheDocument();
    expect(screen.getByText('🌍')).toBeInTheDocument();
    expect(screen.getByText('❤️')).toBeInTheDocument();
  });

  it('should handle single selection', () => {
    const mockOnChange = vi.fn();
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <TravelTypeSelector selected={[]} onChange={mockOnChange} />
      </I18nextProvider>
    );

    const relaxamentoButton = Array.from(
      container.querySelectorAll('button')
    )[0];
    fireEvent.click(relaxamentoButton);

    expect(mockOnChange).toHaveBeenCalledWith(['relaxamento']);
  });

  it('should handle multiple selections', () => {
    const mockOnChange = vi.fn();
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <TravelTypeSelector
          selected={['relaxamento']}
          onChange={mockOnChange}
        />
      </I18nextProvider>
    );

    const aventuraButton = Array.from(
      container.querySelectorAll('button')
    )[1];
    fireEvent.click(aventuraButton);

    expect(mockOnChange).toHaveBeenCalledWith(['relaxamento', 'aventura']);
  });

  it('should handle deselection', () => {
    const mockOnChange = vi.fn();
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <TravelTypeSelector
          selected={['relaxamento', 'aventura']}
          onChange={mockOnChange}
        />
      </I18nextProvider>
    );

    const relaxamentoButton = Array.from(
      container.querySelectorAll('button')
    )[0];
    fireEvent.click(relaxamentoButton);

    expect(mockOnChange).toHaveBeenCalledWith(['aventura']);
  });

  it('should show checkmark on selected items', () => {
    const mockOnChange = vi.fn();
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <TravelTypeSelector
          selected={['relaxamento', 'aventura']}
          onChange={mockOnChange}
        />
      </I18nextProvider>
    );

    const buttons = container.querySelectorAll('button');
    const relaxamentoButton = buttons[0];
    const aventuraButton = buttons[1];
    const culturaButton = buttons[2];

    expect(relaxamentoButton.getAttribute('aria-pressed')).toBe('true');
    expect(aventuraButton.getAttribute('aria-pressed')).toBe('true');
    expect(culturaButton.getAttribute('aria-pressed')).toBe('false');
  });

  it('should disable all buttons when disabled prop is true', () => {
    const mockOnChange = vi.fn();
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <TravelTypeSelector
          selected={[]}
          onChange={mockOnChange}
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
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should have correct aria-pressed attribute', () => {
    const mockOnChange = vi.fn();
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <TravelTypeSelector
          selected={['relaxamento']}
          onChange={mockOnChange}
        />
      </I18nextProvider>
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('false');
  });

  it('should have correct styling for selected items', () => {
    const mockOnChange = vi.fn();
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <TravelTypeSelector
          selected={['relaxamento']}
          onChange={mockOnChange}
        />
      </I18nextProvider>
    );

    const selectedButton = container.querySelectorAll('button')[0];
    expect(selectedButton.className).toContain('border-blue-500');
    expect(selectedButton.className).toContain('bg-blue-50');
  });
});
