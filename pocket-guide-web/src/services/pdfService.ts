/**
 * pdfService.ts - Enhanced service for generating detailed trip PDFs
 * 
 * Features:
 * - Complete itinerary with all attraction details
 * - Professional multi-page layout
 * - Organized by day with times, addresses, durations
 * - Summary page with trip overview
 * - Responsive styling with colors and sections
 * - Support for landscape and portrait
 * - Automatic page breaks and numbering
 */

import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { Trip, Attraction } from '../types'
import { formatDate } from '../utils/formatDate'

interface PDFOptions {
  format?: 'A4' | 'letter'
  orientation?: 'portrait' | 'landscape'
  includePhotos?: boolean
  t?: (key: string) => string
}

interface DaySchedule {
  dayNumber: number
  date?: string
  attractions: Attraction[]
}

class PDFService {
  private readonly DEFAULT_COLOR: [number, number, number] = [51, 65, 85] // slate-700
  private readonly PRIMARY_COLOR: [number, number, number] = [59, 130, 246] // blue-600
  private readonly SUCCESS_COLOR: [number, number, number] = [34, 197, 94] // green-600
  private readonly TEXT_LIGHT: [number, number, number] = [100, 116, 139] // slate-500
  private readonly BORDER_COLOR: [number, number, number] = [226, 232, 240] // slate-300
  private readonly BG_LIGHT: [number, number, number] = [241, 245, 249] // slate-100

  /**
   * Exporta viagem completa como PDF detalhado
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

      // Setup
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 12
      const contentWidth = pageWidth - 2 * margin

      // Organizar atrações por dia
      const daySchedules = this.organizeDaySchedules(trip)

      // PAGE 1: Capa/Resumo
      this.addCoverPage(pdf, trip, margin, pageWidth, pageHeight, contentWidth)

      // PAGES 2+: Itinerário por dia
      for (let i = 0; i < daySchedules.length; i++) {
        pdf.addPage()
        let yPos = margin

        yPos = this.addDayHeader(
          pdf,
          daySchedules[i],
          trip,
          margin,
          yPos,
          contentWidth,
          pageWidth,
          pageHeight
        )

        yPos = this.addDayAttractions(
          pdf,
          daySchedules[i],
          margin,
          yPos,
          contentWidth,
          pageHeight
        )

        // Footer em cada página
        this.addPageFooter(pdf, i + 2, daySchedules.length + 1, pageWidth, pageHeight, margin)
      }

      // Footer da primeira página
      pdf.setPage(1)
      this.addPageFooter(pdf, 1, daySchedules.length + 1, pageWidth, pageHeight, margin)

      // Download
      const filename = `${trip.destination.replace(/\s+/g, '_')}_itinerario_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(filename)
    } catch (error) {
      console.error('❌ Erro ao exportar PDF:', error)
      throw new Error('Não foi possível exportar o PDF')
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
      console.error('❌ Erro ao converter HTML para imagem:', error)
      throw error
    }
  }

  /**
   * Página de capa com informações gerais
   */
  private addCoverPage(
    pdf: jsPDF,
    trip: Trip,
    x: number,
    pageWidth: number,
    pageHeight: number,
    width: number
  ): void {
    let yPos = pageHeight * 0.3

    // DESTINO - Grande
    pdf.setFontSize(42)
    pdf.setTextColor(...this.PRIMARY_COLOR)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`✈️ ${trip.destination}`, pageWidth / 2, yPos, { align: 'center' })
    yPos += 18

    // País
    if (trip.country) {
      pdf.setFontSize(16)
      pdf.setTextColor(...this.TEXT_LIGHT)
      pdf.setFont('helvetica', 'normal')
      pdf.text(trip.country, pageWidth / 2, yPos, { align: 'center' })
      yPos += 15
    }

    // Linha divisória
    pdf.setDrawColor(...this.BORDER_COLOR)
    pdf.line(x + 20, yPos, pageWidth - x - 20, yPos)
    yPos += 12

    // Informações principais em grid
    const infoData = [
      {
        label: '📅 Datas',
        value: `${formatDate(trip.startDate)} a ${formatDate(trip.endDate)}`
      },
      {
        label: '📊 Dias',
        value: this.calculateDays(trip.startDate, trip.endDate)
      },
      {
        label: '💰 Orçamento',
        value: this.getBudgetLabel(trip.budget)
      },
      {
        label: '🏷️ Categoria',
        value: this.getGroupTypeLabel(trip.groupType)
      },
    ]

    const boxWidth = (width - 6) / 2
    const boxHeight = 14

    for (let i = 0; i < infoData.length; i++) {
      const row = Math.floor(i / 2)
      const col = i % 2
      const boxX = x + col * (boxWidth + 3)
      const boxY = yPos + row * (boxHeight + 4)

      // Box background
      pdf.setFillColor(...this.BG_LIGHT)
      pdf.setDrawColor(...this.BORDER_COLOR)
      pdf.rect(boxX, boxY, boxWidth, boxHeight, 'FD')

      // Label
      pdf.setFontSize(8)
      pdf.setTextColor(...this.TEXT_LIGHT)
      pdf.setFont('helvetica', 'bold')
      pdf.text(infoData[i].label, boxX + 2, boxY + 3.5)

      // Value
      pdf.setFontSize(10)
      pdf.setTextColor(...this.DEFAULT_COLOR)
      pdf.setFont('helvetica', 'normal')
      pdf.text(infoData[i].value, boxX + 2, boxY + 9.5)
    }

    yPos += 40

    // Descrição
    if (trip.description) {
      pdf.setFontSize(10)
      pdf.setTextColor(...this.TEXT_LIGHT)
      pdf.setFont('helvetica', 'normal')
      const splitDesc = pdf.splitTextToSize(trip.description, width - 4)
      pdf.text(splitDesc, pageWidth / 2, yPos, { align: 'center', maxWidth: width })
    }
  }

  /**
   * Header do dia com resumo
   */
  private addDayHeader(
    pdf: jsPDF,
    daySchedule: DaySchedule,
    _trip: Trip,
    x: number,
    y: number,
    _width: number,
    pageWidth: number,
    _pageHeight: number
  ): number {
    // Background
    pdf.setFillColor(...this.PRIMARY_COLOR)
    pdf.rect(0, y - 2, pageWidth, 14, 'F')

    // Dia
    pdf.setFontSize(24)
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`Dia ${daySchedule.dayNumber}`, x, y + 8)

    // Data (se disponível)
    if (daySchedule.date) {
      pdf.setFontSize(10)
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'normal')
      pdf.text(daySchedule.date, pageWidth - x - 20, y + 8, { align: 'right' })
    }

    return y + 18
  }

  /**
   * Atrações do dia
   */
  private addDayAttractions(
    pdf: jsPDF,
    daySchedule: DaySchedule,
    x: number,
    y: number,
    width: number,
    pageHeight: number
  ): number {
    const margin = 12
    const attractionSpacing = 8

    if (daySchedule.attractions.length === 0) {
      pdf.setFontSize(10)
      pdf.setTextColor(...this.TEXT_LIGHT)
      pdf.setFont('helvetica', 'italic')
      pdf.text('Sem atrações neste dia', x, y)
      return y + 10
    }

    // Sort by time
    const sorted = [...daySchedule.attractions].sort((a, b) =>
      (a.time || '').localeCompare(b.time || '')
    )

    for (const attraction of sorted) {
      // Check page break
      if (y + 20 > pageHeight - margin) {
        pdf.addPage()
        y = margin
      }

      // Timeline dot + vertical line
      const dotX = x + 2
      const dotY = y + 2.5
      
      // Dot
      pdf.setFillColor(...this.PRIMARY_COLOR)
      pdf.circle(dotX, dotY, 1.2, 'F')

      // Vertical line (se não for última atração)
      if (sorted.indexOf(attraction) < sorted.length - 1) {
        pdf.setDrawColor(...this.PRIMARY_COLOR)
        pdf.setLineWidth(0.4)
        pdf.line(dotX, dotY + 1.2, dotX, y + attractionSpacing + 5)
      }

      const contentX = x + 8

      // TIME + NAME (Destaque)
      pdf.setFontSize(11)
      pdf.setTextColor(...this.DEFAULT_COLOR)
      pdf.setFont('helvetica', 'bold')
      const timeText = `${attraction.time || '--:--'} - ${attraction.name}`
      const splitName = pdf.splitTextToSize(timeText, width - 8)
      pdf.text(splitName, contentX, y + 2)
      y += splitName.length * 4

      // RAZÃO/CATEGORIA
      pdf.setFontSize(9)
      pdf.setTextColor(...this.SUCCESS_COLOR)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`📌 ${attraction.reason || 'Atração'}`, contentX, y + 3)
      y += 5

      // ENDEREÇO (se disponível)
      if (attraction.location?.address) {
        pdf.setFontSize(8)
        pdf.setTextColor(...this.TEXT_LIGHT)
        pdf.setFont('helvetica', 'normal')
        const splitAddr = pdf.splitTextToSize(`📍 ${attraction.location.address}`, width - 10)
        pdf.text(splitAddr, contentX + 1, y + 1)
        y += splitAddr.length * 3.5
      }

      // COORDENADAS GPS (se disponível)
      if (attraction.location?.lat && attraction.location?.lng) {
        pdf.setFontSize(7)
        pdf.setTextColor(128, 128, 128)
        pdf.setFont('helvetica', 'normal')
        const coords = `GPS: ${attraction.location.lat.toFixed(4)}, ${attraction.location.lng.toFixed(4)}`
        pdf.text(coords, contentX + 1, y + 1)
        y += 3.5
      }

      // DURAÇÃO + DICAS (na mesma linha se possível)
      const details: string[] = []
      if (attraction.duration) {
        details.push(`⏱️ ${attraction.duration} min`)
      }
      if (attraction.tip) {
        details.push(`💡 ${attraction.tip}`)
      }

      if (details.length > 0) {
        pdf.setFontSize(8)
        pdf.setTextColor(...this.TEXT_LIGHT)
        pdf.setFont('helvetica', 'normal')
        const detailsText = details.join(' | ')
        const splitDetails = pdf.splitTextToSize(detailsText, width - 10)
        pdf.text(splitDetails, contentX + 1, y + 2)
        y += splitDetails.length * 3.5
      }

      // NOTAS (se existir)
      if (attraction.notes) {
        pdf.setFontSize(8)
        pdf.setTextColor(...this.TEXT_LIGHT)
        pdf.setFont('helvetica', 'italic')
        const splitNotes = pdf.splitTextToSize(`Nota: ${attraction.notes}`, width - 10)
        pdf.text(splitNotes, contentX + 1, y + 2)
        y += splitNotes.length * 3.5
      }

      // Spacing
      y += attractionSpacing - 2
    }

    return y
  }

  /**
   * Footer da página
   */
  private addPageFooter(
    pdf: jsPDF,
    pageNumber: number,
    totalPages: number,
    pageWidth: number,
    pageHeight: number,
    margin: number
  ): void {
    const footerY = pageHeight - 8

    // Line
    pdf.setDrawColor(...this.BORDER_COLOR)
    pdf.setLineWidth(0.3)
    pdf.line(margin, footerY - 2, pageWidth - margin, footerY - 2)

    // Left: Generated date
    pdf.setFontSize(8)
    pdf.setTextColor(...this.TEXT_LIGHT)
    pdf.setFont('helvetica', 'normal')
    pdf.text(
      `📋 Gerado em ${new Date().toLocaleDateString('pt-BR')} - Pocket Guide`,
      margin,
      footerY
    )

    // Right: Page number
    pdf.text(
      `Página ${pageNumber}/${totalPages}`,
      pageWidth - margin - 20,
      footerY,
      { align: 'right' }
    )
  }

  /**
   * Organiza atrações por dia com datas
   */
  private organizeDaySchedules(trip: Trip): DaySchedule[] {
    const schedules: DaySchedule[] = []

    // Extrair atrações de várias possíveis localizações
    let attractions: Attraction[] = []

    // 1. Verificar trip.attractions direto
    if (trip.attractions && trip.attractions.length > 0) {
      console.log('📌 Atrações encontradas em trip.attractions')
      attractions = trip.attractions
    }
    // 2. Verificar trip.itinerary
    else if (trip.itinerary) {
      console.log('📌 Itinerário encontrado em trip.itinerary')
      
      let itinerary = trip.itinerary
      
      // Se for string, fazer parse
      if (typeof itinerary === 'string') {
        try {
          itinerary = JSON.parse(itinerary)
        } catch (error) {
          console.error('❌ Erro ao fazer parse do itinerary:', error)
          itinerary = {}
        }
      }

      // 🔧 SUPORTE A DUPLA ENCAPSULAÇÃO: { itinerary: { itinerary: [...] } }
      // Quando vem do CreateTripScreen, pode estar encapsulado duas vezes
      if (itinerary.itinerary && Array.isArray(itinerary.itinerary)) {
        console.log(`📌 Detectada DUPLA ENCAPSULAÇÃO: itinerary.itinerary`)
        attractions = itinerary.itinerary
      }
      // Extrair atrações do itinerário
      else if (itinerary.days && Array.isArray(itinerary.days)) {
        // Formato: { days: [{ attractions: [...] }] }
        console.log(`📌 Itinerário com ${itinerary.days.length} dias`)
        
        itinerary.days.forEach((day: any, dayIndex: number) => {
          if (day.attractions && Array.isArray(day.attractions)) {
            day.attractions.forEach((attr: any) => {
              attractions.push({
                ...attr,
                day: dayIndex + 1, // Garantir que day está definido
              } as Attraction)
            })
          }
        })
      } else if (itinerary.attractions && Array.isArray(itinerary.attractions)) {
        // Formato: { attractions: [...] }
        console.log(`📌 Itinerário com array flat de atrações`)
        attractions = itinerary.attractions
      }
    }

    console.log(`📊 Total de atrações extraídas: ${attractions.length}`)

    if (attractions.length === 0) {
      // Criar estrutura vazia se não houver atrações
      const days = this.calculateDays(trip.startDate, trip.endDate)
      console.log(`⚠️ Sem atrações. Criando ${days} dias vazios`)
      
      for (let i = 1; i <= parseInt(days); i++) {
        schedules.push({
          dayNumber: i,
          attractions: [],
        })
      }
      return schedules
    }

    const grouped = new Map<number, Attraction[]>()

    // Agrupar por dia
    attractions.forEach(attraction => {
      const dayNum = attraction.day || 1
      if (!grouped.has(dayNum)) {
        grouped.set(dayNum, [])
      }
      grouped.get(dayNum)!.push(attraction)
    })

    // Criar schedules
    grouped.forEach((groupedAttractions, dayNumber) => {
      const date = this.calculateDateForDay(trip.startDate, dayNumber)
      schedules.push({
        dayNumber,
        date,
        attractions: groupedAttractions.sort((a, b) => (a.time || '').localeCompare(b.time || '')),
      })
    })

    return schedules.sort((a, b) => a.dayNumber - b.dayNumber)
  }

  /**
   * Calcula data para um dia específico
   */
  private calculateDateForDay(startDate: Date | string, dayNumber: number): string {
    const start = new Date(startDate)
    const date = new Date(start.getTime() + (dayNumber - 1) * 24 * 60 * 60 * 1000)
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      day: '2-digit', 
      month: '2-digit' 
    })
  }

  /**
   * Calcula quantidade de dias
   */
  private calculateDays(startDate: Date | string, endDate: Date | string): string {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return days.toString()
  }

  /**
   * Label do orçamento
   */
  private getBudgetLabel(budget?: string): string {
    const labels: Record<string, string> = {
      'econômico': '💰 Econômico',
      'médio': '💰💰 Médio',
      'luxo': '💰💰💰 Luxo',
    }
    return labels[budget || ''] || 'Não definido'
  }

  /**
   * Label do tipo de grupo
   */
  private getGroupTypeLabel(groupType?: string): string {
    const labels: Record<string, string> = {
      'solo': '🧑 Solo',
      'casal': '👥 Casal',
      'amigos': '👫 Amigos',
      'família': '👨‍👩‍👧‍👦 Família',
      'group': '👨‍👩‍👧 Grupo',
    }
    return labels[groupType || ''] || 'Não especificado'
  }
}

// Singleton instance
export const pdfService = new PDFService()
