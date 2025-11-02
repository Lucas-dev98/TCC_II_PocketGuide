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
  private readonly DEFAULT_COLOR: [number, number, number] = [30, 41, 59] // slate-800
  private readonly PRIMARY_COLOR: [number, number, number] = [59, 130, 246] // blue-600
  private readonly SUCCESS_COLOR: [number, number, number] = [34, 197, 94] // green-600
  private readonly DANGER_COLOR: [number, number, number] = [239, 68, 68] // red-600
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
    let yPos = pageHeight * 0.2

    // DESTINO - Grande e em destaque
    pdf.setFontSize(48)
    pdf.setTextColor(...this.PRIMARY_COLOR)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`✈️ ${trip.destination}`, pageWidth / 2, yPos, { align: 'center' })
    yPos += 20

    // País - subtítulo
    if (trip.country) {
      pdf.setFontSize(14)
      pdf.setTextColor(...this.TEXT_LIGHT)
      pdf.setFont('helvetica', 'normal')
      pdf.text(trip.country, pageWidth / 2, yPos, { align: 'center' })
      yPos += 12
    }

    // Linha divisória elegante
    pdf.setDrawColor(...this.PRIMARY_COLOR)
    pdf.setLineWidth(1)
    pdf.line(pageWidth / 2 - 30, yPos, pageWidth / 2 + 30, yPos)
    yPos += 16

    // Informações principais em grid 2x2
    const infoData = [
      {
        label: '📅 DATAS',
        value: `${formatDate(trip.startDate)} até ${formatDate(trip.endDate)}`
      },
      {
        label: '🗓️ DURAÇÃO',
        value: `${this.calculateDays(trip.startDate, trip.endDate)} dias`
      },
      {
        label: '💰 ORÇAMENTO',
        value: this.getBudgetLabel(trip.budget)
      },
      {
        label: '👥 TIPO',
        value: this.getGroupTypeLabel(trip.groupType)
      },
    ]

    const boxWidth = (width - 8) / 2
    const boxHeight = 18
    const boxPadding = 2

    for (let i = 0; i < infoData.length; i++) {
      const row = Math.floor(i / 2)
      const col = i % 2
      const boxX = x + col * (boxWidth + 4)
      const boxY = yPos + row * (boxHeight + 6)

      // Box background com borda
      pdf.setFillColor(...this.BG_LIGHT)
      pdf.setDrawColor(...this.PRIMARY_COLOR)
      pdf.setLineWidth(0.8)
      pdf.rect(boxX, boxY, boxWidth, boxHeight, 'FD')

      // Label - MAIÚSCULO
      pdf.setFontSize(9)
      pdf.setTextColor(...this.PRIMARY_COLOR)
      pdf.setFont('helvetica', 'bold')
      pdf.text(infoData[i].label, boxX + boxPadding + 1, boxY + 5)

      // Value - destaque
      pdf.setFontSize(11)
      pdf.setTextColor(...this.DEFAULT_COLOR)
      pdf.setFont('helvetica', 'bold')
      const splitValue = pdf.splitTextToSize(infoData[i].value, boxWidth - 4)
      pdf.text(splitValue, boxX + boxPadding + 1, boxY + 11)
    }

    yPos += 50

    // Descrição da viagem (se existir)
    if (trip.description) {
      pdf.setFontSize(10)
      pdf.setTextColor(...this.TEXT_LIGHT)
      pdf.setFont('helvetica', 'normal')
      
      pdf.setFillColor(245, 247, 250)
      pdf.rect(x, yPos - 2, width, 1, 'F')
      
      yPos += 3
      
      const splitDesc = pdf.splitTextToSize(trip.description, width - 4)
      pdf.text(splitDesc, x + 2, yPos)
      yPos += splitDesc.length * 4 + 3
      
      pdf.rect(x, yPos + 1, width, 1, 'F')
    }

    // Rodapé da capa
    yPos = pageHeight - 20
    pdf.setFontSize(8)
    pdf.setTextColor(...this.TEXT_LIGHT)
    pdf.setFont('helvetica', 'italic')
    pdf.text('Seu guia de viagem personalizado pelo Pocket Guide', pageWidth / 2, yPos, { align: 'center' })
    pdf.text(new Date().toLocaleDateString('pt-BR'), pageWidth / 2, yPos + 5, { align: 'center' })
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
    // Background gradiente simulado (retângulo azul)
    pdf.setFillColor(...this.PRIMARY_COLOR)
    pdf.rect(0, y - 2, pageWidth, 16, 'F')

    // Dia número em grande
    pdf.setFontSize(28)
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`DIA ${daySchedule.dayNumber}`, x, y + 9)

    // Data (se disponível)
    if (daySchedule.date) {
      pdf.setFontSize(11)
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'normal')
      pdf.text(daySchedule.date, pageWidth - x - 20, y + 9, { align: 'right' })
    }

    return y + 22
  }

  /**
   * Atrações do dia com formatação melhorada
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
    const minBottomSpace = 20

    if (daySchedule.attractions.length === 0) {
      pdf.setFontSize(11)
      pdf.setTextColor(...this.TEXT_LIGHT)
      pdf.setFont('helvetica', 'italic')
      pdf.text('✨ Nenhuma atração agendada para este dia', x, y + 5)
      return y + 15
    }

    // Sort by time
    const sorted = [...daySchedule.attractions].sort((a, b) =>
      (a.time || '').localeCompare(b.time || '')
    )

    for (let idx = 0; idx < sorted.length; idx++) {
      const attraction = sorted[idx]
      const isLast = idx === sorted.length - 1

      // Check page break
      if (y + minBottomSpace > pageHeight - margin) {
        pdf.addPage()
        y = margin
      }

      // Timeline visual
      const dotX = x + 3
      const dotY = y + 3

      // Dot (cor diferente: primeira é verde, restantes são azul)
      const dotColor = idx === 0 ? this.SUCCESS_COLOR : this.PRIMARY_COLOR
      pdf.setFillColor(...dotColor)
      pdf.circle(dotX, dotY, 1.4, 'F')

      // Vertical line connecting to next
      if (!isLast) {
        pdf.setDrawColor(...this.PRIMARY_COLOR)
        pdf.setLineWidth(0.5)
        pdf.line(dotX, dotY + 1.4, dotX, y + 24)
      }

      // Card background leve
      pdf.setFillColor(248, 250, 252)
      pdf.setDrawColor(...this.BORDER_COLOR)
      pdf.setLineWidth(0.3)
      pdf.rect(x + 6, y - 1, width - 6, 1, 'F')

      const contentX = x + 10
      let lineY = y

      // ⏰ HORÁRIO - bem visível
      pdf.setFontSize(12)
      pdf.setTextColor(...this.DANGER_COLOR)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`${attraction.time || '--:--'}`, contentX, lineY + 4)

      // 📍 NOME - destaque principal
      pdf.setFontSize(12)
      pdf.setTextColor(...this.DEFAULT_COLOR)
      pdf.setFont('helvetica', 'bold')
      const nameX = contentX + 18
      const nameWidth = width - 28
      const splitName = pdf.splitTextToSize(attraction.name, nameWidth)
      pdf.text(splitName, nameX, lineY + 4)
      lineY += Math.max(5, splitName.length * 4) + 2

      // 📝 RAZÃO/DESCRIÇÃO
      if (attraction.reason) {
        pdf.setFontSize(9)
        pdf.setTextColor(...this.TEXT_LIGHT)
        pdf.setFont('helvetica', 'normal')
        const splitReason = pdf.splitTextToSize(attraction.reason, nameWidth - 2)
        pdf.text(splitReason, contentX, lineY + 1)
        lineY += splitReason.length * 3.2 + 1
      }

      // 📍 ENDEREÇO - se disponível
      if (attraction.location?.address) {
        pdf.setFontSize(8)
        pdf.setTextColor(100, 100, 100)
        pdf.setFont('helvetica', 'normal')
        const splitAddr = pdf.splitTextToSize(`📍 ${attraction.location.address}`, nameWidth - 2)
        pdf.text(splitAddr, contentX + 1, lineY + 1)
        lineY += splitAddr.length * 2.8 + 0.5
      }

      // 🗺️ COORDENADAS GPS - compacto
      if (attraction.location?.lat && attraction.location?.lng) {
        pdf.setFontSize(7)
        pdf.setTextColor(140, 140, 140)
        pdf.setFont('helvetica', 'normal')
        const coords = `🗺️ ${attraction.location.lat.toFixed(4)}, ${attraction.location.lng.toFixed(4)}`
        pdf.text(coords, contentX + 1, lineY + 1)
        lineY += 2.5
      }

      // Detalhes adicionais em uma linha
      const detailsLine: string[] = []
      if (attraction.duration) {
        detailsLine.push(`⏱️ ${attraction.duration} min`)
      }

      if (detailsLine.length > 0) {
        pdf.setFontSize(8)
        pdf.setTextColor(...this.PRIMARY_COLOR)
        pdf.setFont('helvetica', 'normal')
        pdf.text(detailsLine.join(' • '), contentX, lineY + 2)
        lineY += 3
      }

      // 💡 DICAS - em destaque suave
      if (attraction.tip) {
        pdf.setFillColor(254, 243, 199)
        pdf.setDrawColor(...this.BORDER_COLOR)
        pdf.setLineWidth(0.2)
        pdf.rect(contentX - 1, lineY + 1, nameWidth + 2, 4, 'FD')

        pdf.setFontSize(8)
        pdf.setTextColor(120, 100, 20)
        pdf.setFont('helvetica', 'italic')
        const splitTip = pdf.splitTextToSize(`💡 ${attraction.tip}`, nameWidth - 2)
        pdf.text(splitTip, contentX, lineY + 3)
        lineY += splitTip.length * 2.8 + 1
      }

      // 📝 NOTAS ADICIONAIS
      if (attraction.notes) {
        pdf.setFillColor(225, 239, 254)
        pdf.setDrawColor(...this.BORDER_COLOR)
        pdf.setLineWidth(0.2)
        pdf.rect(contentX - 1, lineY + 1, nameWidth + 2, 4, 'FD')

        pdf.setFontSize(8)
        pdf.setTextColor(20, 80, 120)
        pdf.setFont('helvetica', 'italic')
        const splitNotes = pdf.splitTextToSize(`📝 ${attraction.notes}`, nameWidth - 2)
        pdf.text(splitNotes, contentX, lineY + 3)
        lineY += splitNotes.length * 2.8 + 1
      }

      // Espaço entre atrações
      y = lineY + 6
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
