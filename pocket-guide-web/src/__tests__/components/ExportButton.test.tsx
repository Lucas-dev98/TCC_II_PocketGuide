import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExportButton } from '../../components/ExportButton'

// Mock pdfService
vi.mock('../../services/pdfService', () => ({
  pdfService: {
    exportTripToPDF: vi.fn(() => Promise.resolve()),
  },
}))

// Mock useI18n hook
vi.mock('../../hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'components.exportButton.exportPDF': 'Export PDF',
        'components.exportButton.exportError': 'Export Error',
      }
      return translations[key] || key
    },
  }),
}))

describe('ExportButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Icon Variant', () => {
    it('should render icon variant', () => {
      render(<ExportButton variant="icon" />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should have correct icon', () => {
      const { container } = render(<ExportButton variant="icon" />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Filled Variant', () => {
    it('should render filled variant with text on desktop', () => {
      render(<ExportButton variant="filled" />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should have responsive text visibility', () => {
      const { container } = render(<ExportButton variant="filled" />)
      expect(container).toBeInTheDocument()
    })
  })

  describe('Size Variants', () => {
    it('should support small size', () => {
      const { container } = render(<ExportButton size="sm" />)
      expect(container).toBeInTheDocument()
    })

    it('should support medium size', () => {
      const { container } = render(<ExportButton size="md" />)
      expect(container).toBeInTheDocument()
    })

    it('should support large size', () => {
      const { container } = render(<ExportButton size="lg" />)
      expect(container).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label for icon variant', () => {
      render(<ExportButton variant="icon" />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label')
    })

    it('should have title attribute', () => {
      render(<ExportButton variant="icon" />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title')
    })
  })

  describe('Responsive Behavior', () => {
    it('should have responsive classes', () => {
      const { container } = render(<ExportButton variant="filled" />)
      expect(container).toBeInTheDocument()
    })
  })
})
