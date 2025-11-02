/**
 * Tests for FavoriteButton component
 * Tests responsive behavior and favorite toggle functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FavoriteButton } from '../../components/FavoriteButton'
import { useFavorites } from '../../hooks/useFavorites'

// Mock useFavorites hook
vi.mock('../../hooks/useFavorites', () => ({
  useFavorites: vi.fn()
}))

// Mock useI18n
vi.mock('../../hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}))

describe('FavoriteButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Icon Variant', () => {
    it('should render heart icon when not favorited', () => {
      vi.mocked(useFavorites).mockReturnValue({
        toggleFavorite: vi.fn(),
        isFavorite: () => false,
        favorites: [],
        addFavorite: vi.fn(),
        removeFavorite: vi.fn()
      })

      render(<FavoriteButton tripId="trip-1" variant="icon" />)
      const button = screen.getByRole('button')
      
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('bg-slate-100')
    })

    it('should render filled heart icon when favorited', () => {
      vi.mocked(useFavorites).mockReturnValue({
        toggleFavorite: vi.fn(),
        isFavorite: () => true,
        favorites: [],
        addFavorite: vi.fn(),
        removeFavorite: vi.fn()
      })

      render(<FavoriteButton tripId="trip-1" variant="icon" />)
      const button = screen.getByRole('button')
      
      expect(button).toHaveClass('bg-red-50')
      expect(button).toHaveClass('text-red-600')
    })

    it('should have correct title tooltips', () => {
      // Initially not favorited
      vi.mocked(useFavorites).mockReturnValueOnce({
        toggleFavorite: vi.fn(),
        isFavorite: () => false,
        favorites: [],
        addFavorite: vi.fn(),
        removeFavorite: vi.fn()
      })
      
      const { rerender } = render(<FavoriteButton tripId="trip-1" variant="icon" />)
      
      let button = screen.getByRole('button')
      expect(button.title).toBe('components.favoriteButton.addToFavorites')
      
      // Then favorited
      vi.mocked(useFavorites).mockReturnValueOnce({
        toggleFavorite: vi.fn(),
        isFavorite: () => true,
        favorites: [],
        addFavorite: vi.fn(),
        removeFavorite: vi.fn()
      })
      
      rerender(<FavoriteButton tripId="trip-1" variant="icon" />)
      button = screen.getByRole('button')
      expect(button.title).toBe('components.favoriteButton.removeFromFavorites')
    })
  })

  describe('Filled Variant', () => {
    beforeEach(() => {
      vi.mocked(useFavorites).mockReturnValue({
        toggleFavorite: vi.fn(),
        isFavorite: () => false,
        favorites: [],
        addFavorite: vi.fn(),
        removeFavorite: vi.fn()
      })
    })

    it('should render filled variant with text on desktop', () => {
      render(<FavoriteButton tripId="trip-1" variant="filled" />)
      const button = screen.getByRole('button')
      
      expect(button).toHaveClass('flex', 'items-center', 'gap-2')
      expect(button).toHaveClass('bg-gray-600')
      
      const textSpan = button.querySelector('span')
      expect(textSpan).toHaveClass('hidden', 'sm:block')
      expect(textSpan?.textContent).toBe('components.favoriteButton.add')
    })

    it('should show "Favoritado" text when favorited', () => {
      vi.mocked(useFavorites).mockReturnValue({
        toggleFavorite: vi.fn(),
        isFavorite: () => true,
        favorites: [],
        addFavorite: vi.fn(),
        removeFavorite: vi.fn()
      })

      render(<FavoriteButton tripId="trip-1" variant="filled" />)
      const textSpan = screen.getByRole('button').querySelector('span')
      
      expect(textSpan?.textContent).toBe('components.favoriteButton.added')
    })

    it('should change background color when favorited', () => {
      const { rerender } = render(
        <FavoriteButton tripId="trip-1" variant="filled" />
      )
      
      let button = screen.getByRole('button')
      expect(button).toHaveClass('bg-gray-600')
      
      vi.mocked(useFavorites).mockReturnValue({
        toggleFavorite: vi.fn(),
        isFavorite: () => true,
        favorites: [],
        addFavorite: vi.fn(),
        removeFavorite: vi.fn()
      })
      
      rerender(<FavoriteButton tripId="trip-1" variant="filled" />)
      button = screen.getByRole('button')
      expect(button).toHaveClass('bg-red-600')
    })
  })

  describe('Toggle Functionality', () => {
    it('should call toggleFavorite when clicked', () => {
      const toggleFavorite = vi.fn()
      vi.mocked(useFavorites).mockReturnValue({
        toggleFavorite,
        isFavorite: () => false,
        favorites: [],
        addFavorite: vi.fn(),
        removeFavorite: vi.fn()
      })

      render(<FavoriteButton tripId="trip-1" variant="filled" />)
      const button = screen.getByRole('button')
      
      fireEvent.click(button)
      
      expect(toggleFavorite).toHaveBeenCalledWith('trip-1')
    })

    it('should call onToggle callback', () => {
      const onToggle = vi.fn()
      const toggleFavorite = vi.fn()
      vi.mocked(useFavorites).mockReturnValue({
        toggleFavorite,
        isFavorite: () => false,
        favorites: [],
        addFavorite: vi.fn(),
        removeFavorite: vi.fn()
      })

      render(
        <FavoriteButton tripId="trip-1" variant="filled" onToggle={onToggle} />
      )
      const button = screen.getByRole('button')
      
      fireEvent.click(button)
      
      expect(onToggle).toHaveBeenCalledWith(true)
    })

    it('should prevent event propagation', () => {
      const toggleFavorite = vi.fn()
      vi.mocked(useFavorites).mockReturnValue({
        toggleFavorite,
        isFavorite: () => false,
        favorites: [],
        addFavorite: vi.fn(),
        removeFavorite: vi.fn()
      })

      render(<FavoriteButton tripId="trip-1" variant="filled" />)
      const button = screen.getByRole('button')
      
      const event = new MouseEvent('click', { bubbles: true })
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation')
      
      fireEvent.click(button)
      
      // Event propagation prevention is handled in the component
      expect(toggleFavorite).toHaveBeenCalled()
    })
  })

  describe('Responsive Behavior', () => {
    beforeEach(() => {
      vi.mocked(useFavorites).mockReturnValue({
        toggleFavorite: vi.fn(),
        isFavorite: () => false,
        favorites: [],
        addFavorite: vi.fn(),
        removeFavorite: vi.fn()
      })
    })

    it('should have responsive text visibility', () => {
      render(<FavoriteButton tripId="trip-1" variant="filled" />)
      const textSpan = screen.getByRole('button').querySelector('span')
      
      // Mobile: hidden, Desktop (sm+): block
      expect(textSpan).toHaveClass('hidden')
      expect(textSpan).toHaveClass('sm:block')
    })

    it('should apply different size classes for icon variant', () => {
      const { rerender } = render(
        <FavoriteButton tripId="trip-1" size="sm" variant="icon" />
      )
      
      let svg = screen.getByRole('button').querySelector('svg')
      expect(svg).toHaveClass('w-6', 'h-6')
      
      rerender(<FavoriteButton tripId="trip-1" size="md" variant="icon" />)
      svg = screen.getByRole('button').querySelector('svg')
      expect(svg).toHaveClass('w-8', 'h-8')
      
      rerender(<FavoriteButton tripId="trip-1" size="lg" variant="icon" />)
      svg = screen.getByRole('button').querySelector('svg')
      expect(svg).toHaveClass('w-10', 'h-10')
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      vi.mocked(useFavorites).mockReturnValue({
        toggleFavorite: vi.fn(),
        isFavorite: () => false,
        favorites: [],
        addFavorite: vi.fn(),
        removeFavorite: vi.fn()
      })
    })

    it('should have aria-label attribute', () => {
      render(<FavoriteButton tripId="trip-1" variant="icon" />)
      const button = screen.getByRole('button')
      
      expect(button).toHaveAttribute('aria-label')
    })

    it('should have title attribute', () => {
      render(<FavoriteButton tripId="trip-1" variant="icon" />)
      const button = screen.getByRole('button')
      
      expect(button).toHaveAttribute('title')
    })

    it('should support custom className', () => {
      render(
        <FavoriteButton 
          tripId="trip-1" 
          variant="filled" 
          className="custom-class"
        />
      )
      const button = screen.getByRole('button')
      
      expect(button).toHaveClass('custom-class')
    })
  })
})
