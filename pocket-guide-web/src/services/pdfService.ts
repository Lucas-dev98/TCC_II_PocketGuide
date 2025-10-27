/**
 * pdfService.ts - Serviço de geração de PDF para viagens
 * 
 * Funcionalidades:
 * - Gera PDF com detalhes completos da viagem
 * - Estilo profissional com imagens
 * - Suporte para paisagem e retrato
 * - Download automático
 */

import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { Trip, Attraction } from '../types'

interface PDFOptions {
  format?: 'A4' | 'letter'
  orientation?: 'portrait' | 'landscape'
  includeMap?: boolean
  includePhotos?: boolean
}

class PDFService {
  private readonly DEFAULT_COLOR: [number, number, number] = [51, 65, 85] // slate-700

  /**
   * Exporta viagem como PDF
   */
  async exportTripToPDF(trip: Trip, options: PDFOptions = {}): Promise<void> {
    const {
      format = 'A4',
      orientation = 'portrait',
    } = options

    try {
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format,
      })

      // Page setup
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 15
      const contentWidth = pageWidth - 2 * margin

      let yPosition = margin

      // Header com destination
      yPosition = this.addHeader(pdf, trip, margin, yPosition, contentWidth)

      // Trip info grid
      yPosition = this.addTripInfo(pdf, trip, margin, yPosition, contentWidth)

      // Add space
      yPosition += 5

      // Itinerary
      yPosition = this.addItinerary(
        pdf,
        trip,
        margin,
        yPosition,
        contentWidth,
        pageHeight
      )

      // Footer
      this.addFooter(pdf, pageWidth, pageHeight)

      // Download
      const filename = `${trip.destination.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(filename)
    } catch (error) {
      console.error('Erro ao exportar PDF:', error)
      throw new Error('Não foi possível exportar o PDF')
    }
  }

  /**
   * Exporta múltiplas viagens como PDF único
   */
  async exportMultipleTripsToPDF(
    trips: Trip[],
    title: string = 'Minhas Viagens',
    options: PDFOptions = {}
  ): Promise<void> {
    const {
      format = 'A4',
      orientation = 'portrait',
    } = options

    try {
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format,
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 15

      // Main title
      pdf.setFontSize(24)
      pdf.setTextColor(...this.DEFAULT_COLOR)
      pdf.text(title, margin, margin + 5)

      let pageNumber = 1
      let isFirstPage = true

      // Add trips
      for (let i = 0; i < trips.length; i++) {
        if (!isFirstPage) {
          pdf.addPage()
        }

        const trip = trips[i]
        let yPosition = margin + (isFirstPage ? 15 : 10)

        // Trip header
        yPosition = this.addHeader(pdf, trip, margin, yPosition, pageWidth - 2 * margin)

        // Trip info
        yPosition = this.addTripInfo(pdf, trip, margin, yPosition, pageWidth - 2 * margin)

        // Itinerary
        yPosition = this.addItinerary(
          pdf,
          trip,
          margin,
          yPosition + 5,
          pageWidth - 2 * margin,
          pageHeight
        )

        // Page number
        pdf.setFontSize(10)
        pdf.setTextColor(128, 128, 128)
        pdf.text(
          `Página ${pageNumber}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        )

        isFirstPage = false
        pageNumber++
      }

      // Footer
      this.addFooter(pdf, pageWidth, pageHeight)

      // Download
      const filename = `viagens_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(filename)
    } catch (error) {
      console.error('Erro ao exportar PDFs:', error)
      throw new Error('Não foi possível exportar os PDFs')
    }
  }

  /**
   * Gera preview de HTML como imagem para PDF
   */
  async htmlToImage(htmlElement: HTMLElement): Promise<string> {
    try {
      const canvas = await html2canvas(htmlElement, {
        backgroundColor: '#ffffff',
        scale: 2,
      })
      return canvas.toDataURL('image/png')
    } catch (error) {
      console.error('Erro ao converter HTML para imagem:', error)
      throw error
    }
  }

  // ==================== Private Methods ====================

  /**
   * Adiciona header com destination
   */
  private addHeader(
    pdf: jsPDF,
    trip: Trip,
    x: number,
    y: number,
    width: number
  ): number {
    // Destination title
    pdf.setFontSize(20)
    pdf.setTextColor(...this.DEFAULT_COLOR)
    pdf.text(`✈️ ${trip.destination}`, x, y)

    y += 7

    // Description
    if (trip.description) {
      pdf.setFontSize(11)
      pdf.setTextColor(100, 116, 139) // slate-500
      const splitText = pdf.splitTextToSize(trip.description, width)
      pdf.text(splitText, x, y)
      y += splitText.length * 4
    }

    return y
  }

  /**
   * Adiciona grid de informações da viagem
   */
  private addTripInfo(
    pdf: jsPDF,
    trip: Trip,
    x: number,
    y: number,
    width: number
  ): number {
    const boxHeight = 15
    const boxMargin = 3
    const infoBoxWidth = (width - boxMargin * 2) / 3

    // Background
    pdf.setFillColor(241, 245, 249) // slate-100
    pdf.setDrawColor(226, 232, 240) // slate-300

    // Info boxes
    const infoBoxes = []

    if (trip.startDate) {
      infoBoxes.push({
        label: 'Início',
        value: new Date(trip.startDate).toLocaleDateString('pt-BR'),
      })
    }

    if (trip.endDate) {
      infoBoxes.push({
        label: 'Fim',
        value: new Date(trip.endDate).toLocaleDateString('pt-BR'),
      })
    }

    if (trip.budget) {
      infoBoxes.push({
        label: 'Orçamento',
        value: trip.budget,
      })
    }

    // Draw boxes
    infoBoxes.forEach((box, index) => {
      const boxX = x + (infoBoxWidth + boxMargin) * index
      pdf.rect(boxX, y, infoBoxWidth, boxHeight, 'FD')

      // Label
      pdf.setFontSize(8)
      pdf.setTextColor(100, 116, 139)
      pdf.text(box.label, boxX + 2, y + 4)

      // Value
      pdf.setFontSize(10)
      pdf.setTextColor(...this.DEFAULT_COLOR)
      pdf.text(box.value, boxX + 2, y + 10)
    })

    return y + boxHeight + 3
  }

  /**
   * Adiciona itinerário
   */
  private addItinerary(
    pdf: jsPDF,
    trip: Trip,
    x: number,
    y: number,
    width: number,
    pageHeight: number
  ): number {
    const margin = 15
    const lineHeight = 6

    // Group by day
    const byDay = this.groupAttractionsByDay(trip.attractions)
    const days = Object.keys(byDay).sort((a, b) => parseInt(a) - parseInt(b))

    // Itinerary title
    pdf.setFontSize(14)
    pdf.setTextColor(...this.DEFAULT_COLOR)
    pdf.text('Itinerário', x, y)
    y += 8

    // Days
    for (const dayStr of days) {
      const dayNumber = parseInt(dayStr)
      const attractions = byDay[dayNumber] || []

      // Check if need new page
      if (y + attractions.length * 8 > pageHeight - margin) {
        pdf.addPage()
        y = margin
      }

      // Day header
      pdf.setFontSize(12)
      pdf.setTextColor(...this.DEFAULT_COLOR)
      pdf.text(`Dia ${dayNumber}`, x, y)
      y += 6

      // Attractions
      attractions.forEach((attraction: Attraction) => {
        // Time + Name
        pdf.setFontSize(10)
        pdf.setTextColor(...this.DEFAULT_COLOR)
        const timeText = `${attraction.time} - ${attraction.name}`
        const splitText = pdf.splitTextToSize(timeText, width - 5)
        pdf.text(splitText, x + 3, y)
        y += splitText.length * lineHeight

        // Duration + Tip (if exists)
        if (attraction.duration || attraction.tip) {
          pdf.setFontSize(9)
          pdf.setTextColor(100, 116, 139)

          let detailText = ''
          if (attraction.duration) {
            detailText += `⏱ ${attraction.duration} min`
          }
          if (attraction.tip) {
            detailText += ` | 💡 ${attraction.tip}`
          }

          const splitDetail = pdf.splitTextToSize(detailText, width - 8)
          pdf.text(splitDetail, x + 5, y)
          y += splitDetail.length * (lineHeight - 1)
        }

        y += 2
      })

      y += 3
    }

    return y
  }

  /**
   * Adiciona footer ao PDF
   */
  private addFooter(pdf: jsPDF, pageWidth: number, pageHeight: number): void {
    const pageCount = pdf.getNumberOfPages()

    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)

      // Line
      pdf.setDrawColor(226, 232, 240)
      pdf.line(15, pageHeight - 12, pageWidth - 15, pageHeight - 12)

      // Date
      pdf.setFontSize(9)
      pdf.setTextColor(100, 116, 139)
      pdf.text(
        `Gerado em ${new Date().toLocaleDateString('pt-BR')} - Pocket Guide`,
        15,
        pageHeight - 7
      )

      // Page number
      if (pageCount > 1) {
        pdf.text(
          `Página ${i}/${pageCount}`,
          pageWidth - 30,
          pageHeight - 7
        )
      }
    }
  }

  /**
   * Agrupa atrações por dia
   */
  private groupAttractionsByDay(attractions?: Attraction[]): Record<number, Attraction[]> {
    if (!attractions) return {}

    const grouped: Record<number, Attraction[]> = {}
    attractions.forEach(attraction => {
      if (!grouped[attraction.day]) {
        grouped[attraction.day] = []
      }
      grouped[attraction.day].push(attraction)
    })

    return grouped
  }
}

// Singleton instance
export const pdfService = new PDFService()
