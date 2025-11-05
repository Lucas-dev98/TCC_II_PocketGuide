import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TripSuccess } from '../../components/TripSuccess';

const mockI18n = {
  t: (key: string) => key,
};

vi.mock('react-i18next', async () => {
  const actual = await vi.importActual('react-i18next');
  return {
    ...actual,
    useTranslation: () => mockI18n,
  };
});

describe('TripSuccess', () => {
  const defaultProps = {
    tripId: 'trip-abc-123-xyz',
    tripName: 'Summer Vacation',
    destination: 'Lisboa, Portugal',
    onViewTrip: vi.fn(),
    onCreateNew: vi.fn(),
  };

  it('should render success screen', () => {
    render(<TripSuccess {...defaultProps} />);

    expect(screen.getByText('newFlow.step7.success.title')).toBeInTheDocument();
    expect(screen.getByText('newFlow.step7.success.subtitle')).toBeInTheDocument();
  });

  it('should display trip destination', () => {
    render(<TripSuccess {...defaultProps} />);

    const lisboaElements = screen.queryAllByText('Lisboa, Portugal');
    expect(lisboaElements.length).toBeGreaterThan(0);
  });

  it('should display trip name', () => {
    render(<TripSuccess {...defaultProps} />);

    expect(screen.getByText('Summer Vacation')).toBeInTheDocument();
  });

  it('should display trip ID', () => {
    render(<TripSuccess {...defaultProps} />);

    expect(screen.getByText('trip-abc-123-xyz')).toBeInTheDocument();
  });

  it('should show checkpoints', () => {
    render(<TripSuccess {...defaultProps} />);

    expect(screen.getByText('newFlow.step7.success.itineraryGenerated')).toBeInTheDocument();
    expect(screen.getByText('newFlow.step7.success.budgetCalculated')).toBeInTheDocument();
    expect(screen.getByText('newFlow.step7.success.saved')).toBeInTheDocument();
  });

  it('should call onViewTrip when clicking view trip button', () => {
    const onViewTrip = vi.fn();
    render(
      <TripSuccess
        {...defaultProps}
        onViewTrip={onViewTrip}
      />
    );

    const viewButton = screen.getByText('newFlow.step7.success.viewTrip');
    fireEvent.click(viewButton);

    expect(onViewTrip).toHaveBeenCalled();
  });

  it('should call onCreateNew when clicking create new button', () => {
    const onCreateNew = vi.fn();
    render(
      <TripSuccess
        {...defaultProps}
        onCreateNew={onCreateNew}
      />
    );

    const createButton = screen.getByText('newFlow.step7.success.createNew');
    fireEvent.click(createButton);

    expect(onCreateNew).toHaveBeenCalled();
  });

  it('should have copy ID button', () => {
    render(<TripSuccess {...defaultProps} />);

    const copyButton = screen.getByText('newFlow.step7.success.copyId');
    expect(copyButton).toBeInTheDocument();
  });

  it('should display share message', () => {
    render(<TripSuccess {...defaultProps} />);

    expect(screen.getByText('newFlow.step7.success.shareMessage')).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    render(<TripSuccess {...defaultProps} />);

    expect(screen.getByText('newFlow.step7.success.viewTrip')).toBeInTheDocument();
    expect(screen.getByText('newFlow.step7.success.createNew')).toBeInTheDocument();
  });

  it('should display trip info card', () => {
    render(<TripSuccess {...defaultProps} />);

    expect(screen.getByText('newFlow.step7.success.yourTrip')).toBeInTheDocument();
  });

  it('should display trip ID label', () => {
    render(<TripSuccess {...defaultProps} />);

    expect(screen.getByText('newFlow.step7.success.tripId')).toBeInTheDocument();
  });

  it('should handle long trip IDs gracefully', () => {
    const longTripId = 'trip-very-long-id-with-many-characters-that-should-wrap';
    render(
      <TripSuccess
        {...defaultProps}
        tripId={longTripId}
      />
    );

    expect(screen.getByText(longTripId)).toBeInTheDocument();
  });

  it('should handle special characters in trip name', () => {
    const specialName = "Summer's Adventure & Beach Time!";
    render(
      <TripSuccess
        {...defaultProps}
        tripName={specialName}
      />
    );

    expect(screen.getByText(specialName)).toBeInTheDocument();
  });
});
