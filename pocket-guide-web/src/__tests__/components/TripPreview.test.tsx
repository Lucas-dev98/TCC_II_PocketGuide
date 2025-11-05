import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TripPreview } from '../../components/TripPreview';
import { Trip } from '../../types';

const mockI18n = {
  t: (key: string) => key,
  i18n: { language: 'pt' },
};

vi.mock('react-i18next', async () => {
  const actual = await vi.importActual('react-i18next');
  return {
    ...actual,
    useTranslation: () => mockI18n,
  };
});

describe('TripPreview', () => {
  const mockTrip: Trip = {
    id: 'trip-1',
    userId: 'user-1',
    destination: 'Lisboa',
    tripType: 'cultura',
    duration: 'uma-semana',
    budgetPerDay: 'medio',
    groupType: 'casal',
    travelMonth: '6',
    interests: ['museus', 'gastronomia'],
    startDate: '2025-06-01',
    endDate: '2025-06-07',
  } as Trip;

  const defaultProps = {
    trip: mockTrip,
    onConfirm: vi.fn(),
    onEdit: vi.fn(),
  };

  it('should render trip preview', () => {
    render(<TripPreview {...defaultProps} />);

    expect(screen.getByText('newFlow.step7.title')).toBeInTheDocument();
    expect(screen.getByText('newFlow.step7.subtitle')).toBeInTheDocument();
  });

  it('should display destination details', () => {
    render(<TripPreview {...defaultProps} />);

    const lisboaElements = screen.queryAllByText('Lisboa');
    expect(lisboaElements.length).toBeGreaterThan(0);
  });

  it('should display trip type', () => {
    render(<TripPreview {...defaultProps} />);

    expect(screen.getByText('newFlow.step1.title')).toBeInTheDocument();
  });

  it('should display duration and budget', () => {
    render(<TripPreview {...defaultProps} />);

    expect(screen.getByText('newFlow.step2.title')).toBeInTheDocument();
  });

  it('should display group type', () => {
    render(<TripPreview {...defaultProps} />);

    expect(screen.getByText('newFlow.step3.title')).toBeInTheDocument();
  });

  it('should display month selection', () => {
    render(<TripPreview {...defaultProps} />);

    expect(screen.getByText('newFlow.step4.selectMonth')).toBeInTheDocument();
  });

  it('should display interests', () => {
    render(<TripPreview {...defaultProps} />);

    expect(screen.getByText('newFlow.step6.title')).toBeInTheDocument();
  });

  it('should call onEdit when editing step', () => {
    const onEdit = vi.fn();
    render(
      <TripPreview
        {...defaultProps}
        onEdit={onEdit}
      />
    );

    const editButtons = screen.getAllByText('common.edit');
    fireEvent.click(editButtons[0]);

    expect(onEdit).toHaveBeenCalled();
  });

  it('should call onConfirm when confirming', () => {
    const onConfirm = vi.fn();
    render(
      <TripPreview
        {...defaultProps}
        onConfirm={onConfirm}
      />
    );

    const confirmButton = screen.getByText('newFlow.step7.confirm');
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalled();
  });

  it('should disable confirm button when loading', () => {
    const { rerender } = render(
      <TripPreview
        {...defaultProps}
        isLoading={false}
      />
    );

    let confirmButton = screen.getByText('newFlow.step7.confirm');
    expect(confirmButton).not.toBeDisabled();

    rerender(
      <TripPreview
        {...defaultProps}
        isLoading={true}
      />
    );

    confirmButton = screen.getByText('newFlow.step7.confirming');
    expect(confirmButton).toBeDisabled();
  });

  it('should disable confirm button when destination is missing', () => {
    const tripWithoutDestination = { ...mockTrip, destination: '' } as Trip;
    render(
      <TripPreview
        {...defaultProps}
        trip={tripWithoutDestination}
      />
    );

    const confirmButton = screen.getByText('newFlow.step7.confirm');
    expect(confirmButton).toBeDisabled();
  });

  it('should show budget summary', () => {
    render(<TripPreview {...defaultProps} />);

    expect(screen.getByText('newFlow.step7.budgetSummary')).toBeInTheDocument();
  });

  it('should show warning when required fields are missing', () => {
    const tripWithoutDestination = { ...mockTrip, destination: '' } as Trip;
    render(
      <TripPreview
        {...defaultProps}
        trip={tripWithoutDestination}
      />
    );

    // Check for warning icon or text containing the key
    const warningElements = screen.queryAllByText(/completeInfo|⚠️/);
    expect(warningElements.length).toBeGreaterThan(0);
  });

  it('should display all preview cards', () => {
    render(<TripPreview {...defaultProps} />);

    const steps = screen.queryAllByText(/newFlow.step7.step/);
    // We have 6 steps/cards being shown
    expect(steps.length).toBeGreaterThanOrEqual(5);
  });

  it('should handle missing interests gracefully', () => {
    const tripWithoutInterests = { ...mockTrip, interests: [] };
    render(
      <TripPreview
        {...defaultProps}
        trip={tripWithoutInterests}
      />
    );

    expect(screen.getByText('newFlow.step7.notSelected')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <TripPreview
        {...defaultProps}
        disabled={true}
      />
    );

    const editButtons = screen.queryAllByText('common.edit');
    editButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('should display destination info card', () => {
    render(<TripPreview {...defaultProps} />);

    const lisboaElements = screen.queryAllByText('Lisboa');
    expect(lisboaElements.length).toBeGreaterThan(0);
  });
});
