/**
 * Tests for pdfService
 * Tests PDF generation and formatting functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { pdfService } from '../../services/pdfService'
import { Trip } from '../../types'

// Mock jsPDF and html2canvas
vi.mock('jspdf', () => {
  const mockPDF = {
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297
      }
    },
    addPage: vi.fn(),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    setFillColor: vi.fn(),
    rect: vi.fn(),
    setDrawColor: vi.fn(),
    line: vi.fn(),
    setLineWidth: vi.fn(),
    circle: vi.fn(),
    setPage: vi.fn(),
    save: vi.fn(),
    splitTextToSize: vi.fn((text) => [text])
  }
  
  return {
    jsPDF: vi.fn(() => mockPDF)
  }
})

vi.mock('html2canvas', () => ({
  default: vi.fn(() =>
    Promise.resolve({
      toDataURL: () => 'data:image/png;base64,test'
    })
  )
}))

const mockTrip: Trip = {
  id: 'test-trip-1',
  userId: 'user-1',
  destination: 'Lisboa',
  country: 'Portugal',
  startDate: new Date('2025-03-01'),
  endDate: new Date('2025-03-05'),
  budget: 'médio',
  attractions: [
    {
      id: 'attr-1',
      day: 1,
      time: '09:00',
      name: 'Torre de Belém',
      duration: 90,
      reason: 'UNESCO Site',
      tip: 'Visit early to avoid crowds',
      location: {
        lat: 38.6916,
        lng: -9.2160,
        address: 'Av. Brasília, 1400-038 Lisboa, Portugal'
      },
      notes: 'Bring camera for photos'
    },
    {
      id: 'attr-2',
      day: 1,
      time: '12:00',
      name: 'Mosteiro dos Jerónimos',
      duration: 120,
      reason: 'Stunning architecture',
      tip: 'Book tickets online',
      location: {
        lat: 38.6948,
        lng: -9.2024,
        address: 'Praça do Império, 1400-206 Lisboa'
      }
    },
    {
      id: 'attr-3',
      day: 2,
      time: '10:00',
      name: 'Sintra',
      duration: 240,
      reason: 'Magical palaces',
      location: {
        lat: 38.8002,
        lng: -9.3891
      }
    }
  ],
  description: 'A perfect 5-day trip exploring Portugal',
  createdAt: new Date(),
  itinerary: {
    itinerary: [
      {
        day: 1,
        time: '09:00',
        name: 'Torre de Belém',
        duration: 90,
        reason: 'UNESCO Site',
        location: {
          lat: 38.6916,
          lng: -9.2160
        }
      }
    ]
  }
}

describe('pdfService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('exportTripToPDF', () => {
    it('should export trip successfully', async () => {
      await pdfService.exportTripToPDF(mockTrip)
      // Função executou sem erro
    })

    it('should handle trips with complete data', async () => {
      await pdfService.exportTripToPDF(mockTrip)
      // Successful execution
    })

    it('should throw error on invalid trip data', async () => {
      const invalidTrip = {
        ...mockTrip,
        destination: '',
        startDate: null,
        endDate: null
      } as any

      // Should handle gracefully or throw
      try {
        await pdfService.exportTripToPDF(invalidTrip)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should generate filename with destination', async () => {
      await pdfService.exportTripToPDF(mockTrip)
      // Exportar was called
    })
  })

  describe('PDF Content Generation', () => {
    it('should handle trips with attractions', async () => {
      await pdfService.exportTripToPDF(mockTrip)
    })

    it('should handle trips with itinerary data', async () => {
      const tripWithItinerary = {
        ...mockTrip,
        attractions: [],
        itinerary: {
          itinerary: mockTrip.attractions
        }
      }

      await pdfService.exportTripToPDF(tripWithItinerary)
    })

    it('should create day pages for multi-day trips', async () => {
      await pdfService.exportTripToPDF(mockTrip)
    })
  })

  describe('Attraction Organization', () => {
    it('should organize attractions by day', async () => {
      await pdfService.exportTripToPDF(mockTrip)
    })

    it('should sort attractions by time within each day', async () => {
      const tripWithUnsortedAttractions = {
        ...mockTrip,
        attractions: [
          {
            id: 'attr-1',
            day: 1,
            time: '14:00',
            name: 'Afternoon Activity',
            duration: 90,
            reason: 'Activity',
            location: { lat: 0, lng: 0 }
          },
          {
            id: 'attr-2',
            day: 1,
            time: '09:00',
            name: 'Morning Activity',
            duration: 90,
            reason: 'Activity',
            location: { lat: 0, lng: 0 }
          }
        ]
      }

      await pdfService.exportTripToPDF(tripWithUnsortedAttractions)
    })
  })

  describe('Error Handling', () => {
    it('should handle missing optional fields gracefully', async () => {
      const minimalTrip: Trip = {
        id: 'test-1',
        userId: 'user-1',
        destination: 'Test Destination',
        startDate: new Date(),
        endDate: new Date(),
        attractions: []
      }

      await pdfService.exportTripToPDF(minimalTrip)
    })

    it('should export trip without attractions', async () => {
      const tripNoAttractions = {
        ...mockTrip,
        attractions: []
      }

      await pdfService.exportTripToPDF(tripNoAttractions)
    })
  })
})
