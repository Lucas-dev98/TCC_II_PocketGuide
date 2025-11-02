/**
 * Tests for ExportButton component
 * Tests responsive behavior and PDF export functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExportButton } from '../../components/ExportButton'
import { pdfService } from '../../services/pdfService'
import * as i18nModule from '../../hooks/useI18n'

// Mock pdfService
vi.mock('../../services/pdfService', () => ({
  pdfService: {
    exportTripToPDF: vi.fn().mockResolvedValue(undefined)
  }
}))

// Mock useI18n
vi.mock('../../hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}))

const mockTrip = {
  id: 'test-trip-1',
  userId: 'user-1',
  destination: 'Lisboa',
  country: 'Portugal',
  startDate: new Date('2025-03-01'),
  endDate: new Date('2025-03-05'),
  attractions: [
    {
      id: 'attr-1',
      day: 1,
      time: '09:00',
      name: 'Torre de Belém',
      duration: 90,
      reason: 'UNESCO Site',
      location: { lat: 38.6916, lng: -9.2160 },
      category: 'historical'
    }
  ]
}

describe('ExportButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Icon Variant', () => {
    it('should render icon variant with download icon', () => {
      render(<ExportButton trip={mockTrip} variant="icon" />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('rounded-lg', 'bg-green-50')
    })

    it('should have title tooltip with translation key', () => {
      render(<ExportButton trip={mockTrip} variant="icon" />)
      const button = screen.getByRole('button')
      expect(button.title).toBe('components.exportButton.exportPDF')
    })

    it('should be disabled when trip is not provided', () => {
      render(<ExportButton variant="icon" />)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Filled Variant', () => {
    it('should render filled variant with icon and text on desktop', () => {
      render(<ExportButton trip={mockTrip} variant="filled" />)
      const button = screen.getByRole('button')
      
      expect(button).toHaveClass('bg-green-600')
      expect(button).toHaveClass('text-white')
      
      // Text should be hidden on mobile (hidden class)
      const textSpan = button.querySelector('span')
      expect(textSpan?.textContent).toBe('components.exportButton.exportPDF')
    })

    it('should render with flex and gap for proper spacing', () => {
      render(<ExportButton trip={mockTrip} variant="filled" />)
      const button = screen.getByRole('button')
      
      expect(button).toHaveClass('flex', 'items-center', 'gap-2')
    })

    it('should be disabled when trip is not provided', () => {
      render(<ExportButton variant="filled" />)
      const button = screen.getByRole('button')
      
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:bg-gray-400')
    })
  })

  describe('Export Functionality', () => {
    it('should call pdfService.exportTripToPDF when clicked', async () => {
      render(<ExportButton trip={mockTrip} variant="filled" />)
      const button = screen.getByRole('button')
      
      fireEvent.click(button)
      
      expect(pdfService.exportTripToPDF).toHaveBeenCalledWith(
        mockTrip,
        expect.objectContaining({
          format: 'A4',
          orientation: 'portrait'
        })
      )
    })

    it('should call onExport callback after successful export', async () => {
      const onExport = vi.fn()
      render(<ExportButton trip={mockTrip} variant="filled" onExport={onExport} />)
      const button = screen.getByRole('button')
      
      fireEvent.click(button)
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(onExport).toHaveBeenCalled()
    })

    it('should handle export errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(pdfService.exportTripToPDF).mockRejectedValueOnce(
        new Error('Export failed')
      )
      
      render(<ExportButton trip={mockTrip} variant="filled" />)
      const button = screen.getByRole('button')
      
      fireEvent.click(button)
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(consoleError).toHaveBeenCalled()
      consoleError.mockRestore()
    })
  })

  describe('Responsive Behavior', () => {
    it('should apply responsive classes for hidden sm:block', () => {
      render(<ExportButton trip={mockTrip} variant="filled" />)
      const textSpan = screen.getByRole('button').querySelector('span')
      
      // On mobile, text is hidden
      // On sm (640px+), text is block
      expect(textSpan).toHaveClass('hidden', 'sm:block')
    })

    it('should apply different size classes correctly', () => {
      const { rerender } = render(
        <ExportButton trip={mockTrip} size="sm" variant="filled" />
      )
      
      let button = screen.getByRole('button')
      expect(button).toHaveClass('p-1.5', 'text-sm')
      
      rerender(<ExportButton trip={mockTrip} size="md" variant="filled" />)
      button = screen.getByRole('button')
      expect(button).toHaveClass('p-2', 'text-base')
      
      rerender(<ExportButton trip={mockTrip} size="lg" variant="filled" />)
      button = screen.getByRole('button')
      expect(button).toHaveClass('p-3', 'text-lg')
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria attributes', () => {
      render(<ExportButton trip={mockTrip} variant="icon" />)
      const button = screen.getByRole('button')
      
      expect(button).toHaveAttribute('title')
    })

    it('should support custom className', () => {
      render(
        <ExportButton 
          trip={mockTrip} 
          variant="filled" 
          className="custom-class"
        />
      )
      const button = screen.getByRole('button')
      
      expect(button).toHaveClass('custom-class')
    })
  })
})
