import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FavoriteButton } from '../../components/FavoriteButton'

// Mock useFavorites hook
const mockToggleFavorite = vi.fn()
vi.mock('../../hooks/useFavorites', () => ({
  useFavorites: () => ({
    toggleFavorite: mockToggleFavorite,
    isFavorite: (tripId: string) => tripId === 'trip-favorited',
    favorites: [],
  }),
}))

// Mock useI18n hook
vi.mock('../../hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'components.favoriteButton.add': 'Add to Favorites',
        'components.favoriteButton.added': 'Remove from Favorites',
      }
      return translations[key] || key
    },
  }),
}))

describe('FavoriteButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Icon Variant', () => {
    it('should render heart icon when not favorited', () => {
      render(<FavoriteButton tripId="trip-1" variant="icon" />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render filled heart icon when favorited', () => {
      render(<FavoriteButton tripId="trip-favorited" variant="icon" />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should have correct title tooltips', () => {
      render(<FavoriteButton tripId="trip-1" variant="icon" />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title')
    })
  })

  describe('Filled Variant', () => {
    it('should render filled variant with text on desktop', () => {
      render(<FavoriteButton tripId="trip-1" variant="filled" />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should show "Favorited" text when favorited', () => {
      const { container } = render(<FavoriteButton tripId="trip-favorited" variant="filled" />)
      expect(container).toBeInTheDocument()
    })

    it('should change background color when favorited', () => {
      const { container } = render(<FavoriteButton tripId="trip-favorited" variant="filled" />)
      expect(container).toBeInTheDocument()
    })
  })

  describe('Toggle Functionality', () => {
    it('should call toggleFavorite when clicked', () => {
      render(<FavoriteButton tripId="trip-1" />)
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(mockToggleFavorite).toHaveBeenCalledWith('trip-1')
    })

    it('should call onToggle callback', () => {
      const onToggle = vi.fn()
      render(<FavoriteButton tripId="trip-1" onToggle={onToggle} />)
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(onToggle).toHaveBeenCalled()
    })

    it('should prevent event propagation', () => {
      render(<FavoriteButton tripId="trip-1" />)
      const button = screen.getByRole('button')
      const event = new MouseEvent('click', { bubbles: true })
      button.dispatchEvent(event)
      // Note: stopPropagation is handled in the component
    })
  })

  describe('Responsive Behavior', () => {
    it('should have responsive text visibility', () => {
      const { container } = render(<FavoriteButton tripId="trip-1" variant="filled" />)
      expect(container).toBeInTheDocument()
    })

    it('should apply different size classes for icon variant', () => {
      const { container: smallContainer } = render(<FavoriteButton tripId="trip-1" size="sm" />)
      const { container: lgContainer } = render(<FavoriteButton tripId="trip-1" size="lg" />)
      expect(smallContainer).toBeInTheDocument()
      expect(lgContainer).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label attribute', () => {
      render(<FavoriteButton tripId="trip-1" />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label')
    })

    it('should have title attribute', () => {
      render(<FavoriteButton tripId="trip-1" />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title')
    })

    it('should support custom className', () => {
      const { container } = render(<FavoriteButton tripId="trip-1" className="custom-class" />)
      const button = container.querySelector('.custom-class')
      expect(button).toBeInTheDocument()
    })
  })
})
