import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import GroupCompositionSelector from '../../components/GroupCompositionSelector';

describe('GroupCompositionSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all group options', () => {
    const mockOnGroupChange = vi.fn();

    render(
      <I18nextProvider i18n={i18n}>
        <GroupCompositionSelector
          selectedGroup=""
          onGroupChange={mockOnGroupChange}
        />
      </I18nextProvider>
    );

    expect(screen.getByText('👤')).toBeInTheDocument();
    expect(screen.getByText('👥')).toBeInTheDocument();
    expect(screen.getByText('👨‍👩‍👧‍👦')).toBeInTheDocument();
    expect(screen.getByText('👫')).toBeInTheDocument();
    expect(screen.getByText('🎓')).toBeInTheDocument();
  });

  it('should handle group selection', () => {
    const mockOnGroupChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <GroupCompositionSelector
          selectedGroup=""
          onGroupChange={mockOnGroupChange}
        />
      </I18nextProvider>
    );

    const buttons = Array.from(container.querySelectorAll('button'));
    fireEvent.click(buttons[0]);

    expect(mockOnGroupChange).toHaveBeenCalledWith('solo');
  });

  it('should show selected state', () => {
    const mockOnGroupChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <GroupCompositionSelector
          selectedGroup="casal"
          onGroupChange={mockOnGroupChange}
        />
      </I18nextProvider>
    );

    const buttons = Array.from(container.querySelectorAll('button'));
    expect(buttons[1].className).toContain('border-purple-500');
  });

  it('should show conditional fields for family', () => {
    const mockOnGroupChange = vi.fn();
    const mockOnNumPeopleChange = vi.fn();
    const mockOnNumChildrenChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <GroupCompositionSelector
          selectedGroup="familia"
          numPeople={4}
          numChildren={2}
          onGroupChange={mockOnGroupChange}
          onNumPeopleChange={mockOnNumPeopleChange}
          onNumChildrenChange={mockOnNumChildrenChange}
        />
      </I18nextProvider>
    );

    // Should show input fields
    const inputs = container.querySelectorAll('input[type="number"]');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('should show only people count for amigos', () => {
    const mockOnGroupChange = vi.fn();
    const mockOnNumPeopleChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <GroupCompositionSelector
          selectedGroup="amigos"
          numPeople={3}
          onGroupChange={mockOnGroupChange}
          onNumPeopleChange={mockOnNumPeopleChange}
        />
      </I18nextProvider>
    );

    // Should show input for people count
    const inputs = container.querySelectorAll('input[type="number"]');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  it('should not show conditional fields for solo', () => {
    const mockOnGroupChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <GroupCompositionSelector
          selectedGroup="solo"
          onGroupChange={mockOnGroupChange}
        />
      </I18nextProvider>
    );

    // Should not show input fields
    const inputs = container.querySelectorAll('input[type="number"]');
    expect(inputs.length).toBe(0);
  });

  it('should handle people count change', () => {
    const mockOnGroupChange = vi.fn();
    const mockOnNumPeopleChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <GroupCompositionSelector
          selectedGroup="familia"
          numPeople={2}
          onGroupChange={mockOnGroupChange}
          onNumPeopleChange={mockOnNumPeopleChange}
        />
      </I18nextProvider>
    );

    const inputs = container.querySelectorAll('input[type="number"]');
    const peopleInput = inputs[0] as HTMLInputElement;

    fireEvent.change(peopleInput, { target: { value: '5' } });
    expect(mockOnNumPeopleChange).toHaveBeenCalledWith(5);
  });

  it('should handle children count change', () => {
    const mockOnGroupChange = vi.fn();
    const mockOnNumChildrenChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <GroupCompositionSelector
          selectedGroup="familia"
          numChildren={1}
          onGroupChange={mockOnGroupChange}
          onNumChildrenChange={mockOnNumChildrenChange}
        />
      </I18nextProvider>
    );

    const inputs = container.querySelectorAll('input[type="number"]');
    const childrenInput = inputs[1] as HTMLInputElement;

    fireEvent.change(childrenInput, { target: { value: '3' } });
    expect(mockOnNumChildrenChange).toHaveBeenCalledWith(3);
  });

  it('should disable all buttons when disabled prop is true', () => {
    const mockOnGroupChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <GroupCompositionSelector
          selectedGroup=""
          onGroupChange={mockOnGroupChange}
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
    expect(mockOnGroupChange).not.toHaveBeenCalled();
  });

  it('should show summary for selected group', () => {
    const mockOnGroupChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <GroupCompositionSelector
          selectedGroup="amigos"
          numPeople={4}
          onGroupChange={mockOnGroupChange}
        />
      </I18nextProvider>
    );

    // Should have summary section with composition info
    const summaryBox = container.querySelector('.bg-indigo-50');
    expect(summaryBox).toBeInTheDocument();
  });

  it('should have correct aria-pressed attributes', () => {
    const mockOnGroupChange = vi.fn();

    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <GroupCompositionSelector
          selectedGroup="casal"
          onGroupChange={mockOnGroupChange}
        />
      </I18nextProvider>
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
  });
});
