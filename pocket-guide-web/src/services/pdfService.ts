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

// Helper para codificar texto em Latin-1
function encodeToLatin1(str: string): string {
  const latinMap: { [key: string]: string } = {
    'á': '\xE1', 'é': '\xE9', 'í': '\xED', 'ó': '\xF3', 'ú': '\xFA',
    'à': '\xE0', 'è': '\xE8', 'ì': '\xEC', 'ò': '\xF2', 'ù': '\xF9',
    'ã': '\xE3', 'õ': '\xF5', 'â': '\xE2', 'ê': '\xEA', 'ô': '\xF4',
    'ä': '\xE4', 'ë': '\xEB', 'ï': '\xEF', 'ö': '\xF6', 'ü': '\xFC',
    'ç': '\xE7', 'ñ': '\xF1',
    'Á': '\xC1', 'É': '\xC9', 'Í': '\xCD', 'Ó': '\xD3', 'Ú': '\xDA',
    'À': '\xC0', 'È': '\xC8', 'Ì': '\xCC', 'Ò': '\xD2', 'Ù': '\xD9',
    'Ã': '\xC3', 'Õ': '\xD5', 'Â': '\xC2', 'Ê': '\xCA', 'Ô': '\xD4',
    'Ä': '\xC4', 'Ë': '\xCB', 'Ï': '\xCF', 'Ö': '\xD6', 'Ü': '\xDC',
    'Ç': '\xC7', 'Ñ': '\xD1',
  }

  let result = str
  for (const [char, code] of Object.entries(latinMap)) {
    result = result.replace(new RegExp(char, 'g'), code)
  }
  return result
}

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
  private readonly ACCENT_COLOR: [number, number, number] = [99, 102, 241] // indigo-600

  /**
   * Remove acentos e normaliza texto para PDF
   */
  private normalizeText(text: string): string {
    if (!text) return ''
    // Converter para Latin-1 para jsPDF renderizar corretamente
    return encodeToLatin1(text).trim()
  }

  /**
   * Exporta viagem completa como PDF detalhado (versão renderizada por HTML)
   */
  async exportTripToPDF(trip: Trip, options: PDFOptions = {}): Promise<void> {
    const {
      format = 'A4',
      orientation = 'portrait',
    } = options

    try {
      console.log('📄 Starting PDF export for trip:', trip.destination)
      console.log('📅 Start date:', trip.startDate, '| End date:', trip.endDate)

      // Validar dados essenciais
      if (!trip.destination) {
        throw new Error('❌ Destination é obrigatório')
      }
      if (!trip.startDate || !trip.endDate) {
        throw new Error('❌ Start date e End date são obrigatórios')
      }

      // Criar elemento HTML para renderizar
      const htmlContent = this.generatePDFHTML(trip)
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlContent
      tempDiv.style.position = 'absolute'
      tempDiv.style.top = '-9999px'
      tempDiv.style.left = '-9999px'
      tempDiv.style.width = orientation === 'landscape' ? '1024px' : '794px'
      tempDiv.style.backgroundColor = 'white'
      document.body.appendChild(tempDiv)

      // Renderizar como canvas
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      })

      // Remover div temporária
      document.body.removeChild(tempDiv)

      // Criar PDF a partir da imagem
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format,
      })

      const imgData = canvas.toDataURL('image/png')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // Cálculos de proporção
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * pageWidth) / canvas.width
      
      // Renderizar cada página individualmente
      const numPages = Math.ceil(imgHeight / pageHeight)
      console.log(`📄 Total de páginas: ${numPages}`)

      for (let i = 0; i < numPages; i++) {
        if (i > 0) {
          pdf.addPage()
        }
        
        // Calcular a posição vertical da imagem para esta página
        const yOffset = -(pageHeight * i)
        pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight)
      }

      // Download
      const filename = `${trip.destination.replace(/\s+/g, '_')}_itinerario_${new Date().toISOString().split('T')[0]}.pdf`
      console.log('💾 Saving PDF:', filename)
      pdf.save(filename)
      console.log('✅ PDF exportado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao exportar PDF:', error)
      throw new Error(`Não foi possível exportar o PDF: ${error instanceof Error ? error.message : 'erro desconhecido'}`)
    }
  }

  /**
   * Gera HTML completo para renderização do PDF
   */
  private generatePDFHTML(trip: Trip): string {
    const daySchedules = this.organizeDaySchedules(trip)
    const days = this.calculateDays(trip.startDate, trip.endDate)

    return `
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { margin: 0; padding: 0; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            color: #1e293b;
            line-height: 1.5;
            background: white;
          }
          
          /* Configuração de página A4: 210mm x 297mm */
          .page { 
            width: 210mm;
            height: 297mm;
            page-break-after: always;
            background: white;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            margin: 0;
            padding: 0;
          }
          
          /* === PÁGINA DE CAPA === */
          .page.cover-page {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          }
          
          .cover-container {
            padding: 30mm 15mm;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          
          .cover-top {
            flex: 1;
          }
          
          .cover-header {
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 1px;
            opacity: 0.9;
            margin-bottom: 20px;
            color: white;
          }
          
          .cover-title { 
            font-size: 48px;
            font-weight: 900;
            margin: 20px 0 10px 0;
            line-height: 1.1;
            color: white;
          }
          
          .cover-subtitle { 
            font-size: 16px;
            margin-bottom: 30px;
            opacity: 0.95;
            font-weight: 300;
            color: white;
          }
          
          .info-grid { 
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
            margin: 20px 0;
          }
          
          .info-box { 
            background: rgba(255, 255, 255, 0.12);
            padding: 12px;
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .info-label { 
            font-size: 9px;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 4px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .info-value { 
            font-size: 12px;
            font-weight: 700;
            color: white;
            line-height: 1.3;
          }
          
          .cover-bottom {
            background: white;
            padding: 20mm 15mm;
            border-radius: 8px 8px 0 0;
          }
          
          .interests-title { 
            font-size: 14px;
            font-weight: 700;
            color: #3b82f6;
            margin-bottom: 10px;
          }
          
          .interests-list { 
            font-size: 11px;
            line-height: 1.6;
            color: #64748b;
            background: #f8fafc;
            padding: 12px;
            border-radius: 4px;
            border-left: 3px solid #3b82f6;
          }
          
          /* === ÍNDICE === */
          .page.toc-page {
            background: #f8fafc;
          }
          
          .toc-container {
            padding: 20mm 15mm;
            height: 100%;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          
          .toc-title { 
            font-size: 28px;
            font-weight: 900;
            color: #3b82f6;
            margin-bottom: 5px;
          }
          
          .toc-subtitle {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 20px;
            font-weight: 500;
          }
          
          .toc-items {
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .toc-item { 
            padding: 12px;
            font-size: 11px;
            background: white;
            border-radius: 4px;
            border-left: 3px solid #3b82f6;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          }
          
          .toc-day-num {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            background: #3b82f6;
            color: white;
            border-radius: 50%;
            font-weight: 700;
            font-size: 11px;
            flex-shrink: 0;
          }
          
          .toc-day-info {
            flex: 1;
            min-width: 0;
          }
          
          .toc-day-info strong {
            color: #1e293b;
            display: block;
          }
          
          .toc-day-info small {
            color: #94a3b8;
            display: block;
            font-size: 9px;
            margin-top: 1px;
          }
          
          /* === PÁGINAS DE DIAS === */
          .page.day-page {
            background: white;
          }
          
          .day-container {
            padding: 0;
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          
          .day-header { 
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 15mm 15mm 10mm;
            flex-shrink: 0;
            font-size: 20px;
            font-weight: 900;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }
          
          .day-number {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 18px;
          }
          
          .day-date {
            font-size: 11px;
            opacity: 0.9;
            font-weight: 400;
          }
          
          .day-content {
            padding: 15mm;
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          
          .attraction { 
            padding: 10px;
            background: #f8fafc;
            border-radius: 4px;
            border-left: 3px solid #3b82f6;
            page-break-inside: avoid;
            flex-shrink: 0;
          }
          
          .attraction-time { 
            color: #ef4444;
            font-weight: 700;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 5px;
            margin-bottom: 3px;
          }
          
          .attraction-name { 
            font-size: 12px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 3px;
          }
          
          .attraction-detail { 
            font-size: 10px;
            color: #64748b;
            margin: 2px 0;
            display: flex;
            align-items: flex-start;
            gap: 4px;
          }
          
          .attraction-tip {
            background: linear-gradient(135deg, #fef08a 0%, #fef3c7 100%);
            padding: 8px;
            border-radius: 3px;
            border-left: 2px solid #f59e0b;
            margin-top: 6px;
            font-size: 10px;
            color: #92400e;
          }
          
          .attraction-empty {
            color: #94a3b8;
            font-style: italic;
            padding: 20px;
            text-align: center;
            font-size: 11px;
          }
          
          .page-footer {
            margin-top: auto;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
            font-size: 8px;
            color: #94a3b8;
            text-align: center;
            flex-shrink: 0;
          }
          
          @media print {
            body { margin: 0; padding: 0; }
            .page { margin: 0; }
          }
        </style>
      </head>
      <body>
        <!-- PÁGINA 1: Capa -->
        <div class="page cover-page">
          <div class="cover-container">
            <div class="cover-top">
              <div class="cover-header">🎒 POCKET GUIDE</div>
              <div class="cover-title">${trip.destination}</div>
              ${trip.country ? `<div class="cover-subtitle">📍 ${trip.country}</div>` : ''}
              
              <div class="info-grid">
                <div class="info-box">
                  <div class="info-label">📅 Período</div>
                  <div class="info-value">${formatDate(trip.startDate, 'pt-BR')}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">🗓️ Duração</div>
                  <div class="info-value">${days} dias</div>
                </div>
                <div class="info-box">
                  <div class="info-label">💰 Orçamento</div>
                  <div class="info-value">${this.getBudgetLabel(trip.budgetPerDay || trip.budget)}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">👥 Grupo</div>
                  <div class="info-value">${this.getGroupTypeLabel(trip.groupType)}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">✈️ Viagem</div>
                  <div class="info-value">${this.getTripTypeLabel(trip.tripType)}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">⭐ Interesses</div>
                  <div class="info-value">${trip.interests?.length || 0}</div>
                </div>
              </div>
            </div>
            
            <div class="cover-bottom">
              <div class="interests-title">✨ Seus Interesses</div>
              <div class="interests-list">${trip.interests?.join(' • ') || 'Não definido'}</div>
              <div class="page-footer">
                <div>Planejado com ❤️ pelo Pocket Guide</div>
                <div>${new Date().toLocaleDateString('pt-BR')}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- PÁGINA 2: Índice -->
        <div class="page toc-page">
          <div class="toc-container">
            <div class="toc-title">📋 Itinerário</div>
            <div class="toc-subtitle">${trip.destination} • ${days} dias • ${daySchedules.length} dias</div>
            <div class="toc-items">
              ${daySchedules.map(day => `
                <div class="toc-item">
                  <div class="toc-day-num">${day.dayNumber}</div>
                  <div class="toc-day-info">
                    <strong>Dia ${day.dayNumber}</strong>
                    <small>${day.date || ''} • ${day.attractions.length} ${day.attractions.length === 1 ? 'atração' : 'atrações'}</small>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        
        <!-- PÁGINAS 3+: Dias -->
        ${daySchedules.map(day => `
          <div class="page day-page">
            <div class="day-container">
              <div class="day-header">
                <div class="day-number">
                  <span>DIA ${day.dayNumber}</span>
                </div>
                ${day.date ? `<div class="day-date">${day.date}</div>` : ''}
              </div>
              <div class="day-content">
                ${day.attractions.length === 0 ? 
                  '<div class="attraction-empty">✨ Nenhuma atração agendada</div>' :
                  day.attractions
                    .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                    .map(attr => `
                      <div class="attraction">
                        <div class="attraction-time">⏰ ${attr.time || '--:--'}</div>
                        <div class="attraction-name">${attr.name}</div>
                        ${attr.reason ? `<div class="attraction-detail">📝 ${attr.reason}</div>` : ''}
                        ${attr.location?.address ? `<div class="attraction-detail">📍 ${attr.location.address}</div>` : ''}
                        ${attr.duration ? `<div class="attraction-detail">⏱️ ${attr.duration} min</div>` : ''}
                        ${attr.tip ? `<div class="attraction-tip">💡 ${attr.tip}</div>` : ''}
                      </div>
                    `).join('')
                }
                <div class="page-footer">Dia ${day.dayNumber} | Pocket Guide</div>
              </div>
            </div>
          </div>
        `).join('')}
      </body>
      </html>
    `
  }

  /**
   * Gera preview de HTML como imagem para PDF
   */
  async htmlToImage(htmlElement: HTMLElement): Promise<string> {
    try {
      const canvas = await html2canvas(htmlElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })
      return canvas.toDataURL('image/png')
    } catch (error) {
      console.error('❌ Erro ao converter HTML para imagem:', error)
      throw error
    }
  }

  /**
   * Cria PDF a partir de HTML usando canvas (renderização perfeita com UTF-8)
   */
  async createPDFFromHTML(htmlElement: HTMLElement, filename: string): Promise<void> {
    try {
      const canvas = await html2canvas(htmlElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })

      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'A4',
      })

      const imgData = canvas.toDataURL('image/png')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      const imgWidth = pageWidth
      const imgHeight = (canvas.height * pageWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      // Adicionar imagens em múltiplas páginas se necessário
      while (heightLeft > 0) {
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
        if (heightLeft > 0) {
          pdf.addPage()
          position = -pageHeight + heightLeft
        }
      }

      pdf.save(filename)
      console.log('✅ PDF criado com sucesso via HTML!')
    } catch (error) {
      console.error('❌ Erro ao criar PDF do HTML:', error)
      throw error
    }
  }

  /**
   * Página de capa com informações gerais - REDESIGN MELHORADO
   */
  // @ts-expect-error - Métodos legados mantidos para compatibilidade futura
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _addCoverPage(
    pdf: jsPDF,
    trip: Trip,
    x: number,
    pageWidth: number,
    pageHeight: number,
    width: number
  ): void {
    try {
      // Background gradiente superior - azul vibrante
      pdf.setFillColor(...this.PRIMARY_COLOR)
      pdf.rect(0, 0, pageWidth, pageHeight * 0.4, 'F')

      let yPos = 18

      // Logo/Titulo do app
      pdf.setFontSize(9)
      pdf.setTextColor(200, 220, 255)
      pdf.setFont('Arial', 'normal')
      pdf.text('POCKET GUIDE', x, yPos)
      yPos += 14

      // DESTINO - Grande e em destaque (branco sobre o fundo azul)
      pdf.setFontSize(52)
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('Arial', 'bold')
      const destX = pageWidth / 2
      const destY = yPos + 12
      pdf.text(this.normalizeText(trip.destination), destX, destY, { align: 'center' })
      yPos = destY + 22

      // País - subtítulo em branco
      if (trip.country) {
        pdf.setFontSize(13)
        pdf.setTextColor(220, 230, 255)
        pdf.setFont('Arial', 'normal')
        pdf.text(`📍 ${trip.country}`, destX, yPos, { align: 'center' })
      }

      // Agora começam as informações no fundo branco
      yPos = pageHeight * 0.4 + 12

      // Grid 3x2 com informações principais
      const infoData = [
        {
          icon: '📅',
          label: 'Período',
          value: trip.startDate && trip.endDate 
            ? `${formatDate(trip.startDate, 'pt-BR')} a ${formatDate(trip.endDate, 'pt-BR')}`
            : 'Data não disponível'
        },
        {
          icon: '🗓️',
          label: 'Duração',
          value: (trip.startDate && trip.endDate) ? `${this.calculateDays(trip.startDate, trip.endDate)} dias` : '0 dias'
        },
        {
          icon: '💰',
          label: 'Orçamento',
          value: this.getBudgetLabel(trip.budgetPerDay || trip.budget)
        },
        {
          icon: '👥',
          label: 'Tipo de Grupo',
          value: this.getGroupTypeLabel(trip.groupType)
        },
        {
          icon: '✈️',
          label: 'Tipo de Viagem',
          value: this.getTripTypeLabel(trip.tripType)
        },
        {
          icon: '⭐',
          label: 'Total de Interesses',
          value: trip.interests?.length ? `${trip.interests.length} interesses` : 'Não definido'
        },
      ]

      const boxWidth = (width - 10) / 3
      const boxHeight = 24
      
      for (let i = 0; i < infoData.length; i++) {
        const row = Math.floor(i / 3)
        const col = i % 3
        const boxX = x + col * (boxWidth + 3.5)
        const boxY = yPos + row * (boxHeight + 5)

        // Box background com borda sutil
        pdf.setFillColor(255, 255, 255)
        pdf.setDrawColor(...this.BORDER_COLOR)
        pdf.setLineWidth(0.4)
        pdf.rect(boxX, boxY, boxWidth, boxHeight, 'FD')

        // Ícone grande
        pdf.setFontSize(15)
        pdf.setTextColor(...this.PRIMARY_COLOR)
        pdf.setFont('Arial', 'bold')
        pdf.text(infoData[i].icon, boxX + 3, boxY + 6)

        // Label pequeno
        pdf.setFontSize(7)
        pdf.setTextColor(...this.TEXT_LIGHT)
        pdf.setFont('Arial', 'normal')
        pdf.text(infoData[i].label, boxX + 3, boxY + 10)

        // Valor em destaque
        pdf.setFontSize(9)
        pdf.setTextColor(...this.DEFAULT_COLOR)
        pdf.setFont('Arial', 'bold')
        const splitValue = pdf.splitTextToSize(infoData[i].value, boxWidth - 6)
        pdf.text(splitValue, boxX + 3, boxY + 15)
      }

      yPos += 50

      // Seção de Interesses
      if (trip.interests && trip.interests.length > 0) {
        // Título com ícone
        pdf.setFontSize(12)
        pdf.setTextColor(...this.DEFAULT_COLOR)
        pdf.setFont('Arial', 'bold')
        pdf.text('✨ Seus Interesses', x, yPos)
        yPos += 5
        
        pdf.setFillColor(...this.PRIMARY_COLOR)
        pdf.rect(x, yPos - 1, width, 0.5, 'F')
        yPos += 5

        pdf.setFontSize(9)
        pdf.setTextColor(...this.TEXT_LIGHT)
        pdf.setFont('Arial', 'normal')
        
        const interestChunks: string[] = []
        let currentChunk: string[] = []
        let currentWidth = 0
        
        trip.interests.forEach(interest => {
          const interestText = `• ${interest}`
          const textWidth = pdf.getTextWidth(interestText) + 3
          
          if (currentWidth + textWidth > width - 4) {
            interestChunks.push(currentChunk.join('  '))
            currentChunk = [interestText]
            currentWidth = textWidth
          } else {
            currentChunk.push(interestText)
            currentWidth += textWidth
          }
        })
        
        if (currentChunk.length > 0) {
          interestChunks.push(currentChunk.join('  '))
        }
        
        interestChunks.forEach(chunk => {
          pdf.text(chunk, x + 3, yPos)
          yPos += 4
        })
        
        pdf.rect(x, yPos + 1, width, 1, 'F')
      }

      yPos += 6

      // Descrição geral ou próximas ações
      pdf.setFillColor(255, 252, 242)
      pdf.setDrawColor(...this.BORDER_COLOR)
      pdf.setLineWidth(0.3)
      pdf.rect(x, yPos, width, 12, 'FD')

      pdf.setFontSize(9)
      pdf.setTextColor(180, 140, 40)
      pdf.setFont('Arial', 'italic')
      pdf.text('💡 Dica: Baixe este PDF para consultar offline durante sua viagem!', x + 3, yPos + 4)

      // Rodapé da capa
      yPos = pageHeight - 15
      pdf.setFontSize(8)
      pdf.setTextColor(...this.TEXT_LIGHT)
      pdf.setFont('Arial', 'normal')
      pdf.text('Planejado com ❤️ pelo Pocket Guide', pageWidth / 2, yPos, { align: 'center' })
      pdf.text(new Date().toLocaleDateString('pt-BR'), pageWidth / 2, yPos + 5, { align: 'center' })
    } catch (error) {
      console.error('❌ Erro ao adicionar capa:', error)
      throw error
    }
  }

  /**
   * Página de índice/sumário
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // @ts-expect-error Legacy method kept for compatibility
  private _addTableOfContents(
    pdf: jsPDF,
    daySchedules: DaySchedule[],
    trip: Trip,
    x: number,
    _pageWidth: number,
    _pageHeight: number,
    width: number
  ): void {
    let yPos = 15

    // Título
    pdf.setFontSize(28)
    pdf.setTextColor(...this.PRIMARY_COLOR)
    pdf.setFont('Arial', 'bold')
    pdf.text('📋 Seu Itinerário', x, yPos)
    yPos += 11

    // Subtítulo com destino
    pdf.setFontSize(11)
    pdf.setTextColor(...this.TEXT_LIGHT)
    pdf.setFont('Arial', 'normal')
    pdf.text(`${trip.destination} | ${this.calculateDays(trip.startDate, trip.endDate)} dias`, x, yPos)
    yPos += 9

    // Linha separadora decorativa
    pdf.setDrawColor(...this.PRIMARY_COLOR)
    pdf.setLineWidth(1)
    pdf.line(x, yPos, x + width, yPos)
    yPos += 10

    // Resumo rápido em cards
    pdf.setFillColor(255, 255, 255)
    pdf.setDrawColor(...this.BORDER_COLOR)
    pdf.setLineWidth(0.4)
    pdf.rect(x, yPos, width, 16, 'FD')

    yPos += 3
    pdf.setFontSize(9)
    pdf.setTextColor(...this.DEFAULT_COLOR)
    pdf.setFont('Arial', 'normal')
    
    const summaryItems = [
      `✈️ ${this.getTripTypeLabel(trip.tripType)}`,
      `💰 Orçamento: ${this.getBudgetLabel(trip.budgetPerDay || trip.budget)}`,
      `👥 ${this.getGroupTypeLabel(trip.groupType)}`,
      `📍 ${trip.interests?.length || 0} interesses`,
    ]

    const itemsPerLine = 2
    for (let i = 0; i < summaryItems.length; i += itemsPerLine) {
      const line = summaryItems.slice(i, i + itemsPerLine).join('    ')
      pdf.text(line, x + 3, yPos)
      yPos += 4
    }

    yPos += 10

    // Dias da viagem
    pdf.setFontSize(12)
    pdf.setTextColor(...this.DEFAULT_COLOR)
    pdf.setFont('Arial', 'bold')
    pdf.text('📅 Dias da Viagem:', x, yPos)
    yPos += 8

    // Lista de dias
    daySchedules.forEach((day) => {
      pdf.setFontSize(10)
      pdf.setTextColor(...this.DEFAULT_COLOR)
      pdf.setFont('Arial', 'normal')

      const dayInfo = `Dia ${day.dayNumber}`
      const dateInfo = day.date ? ` - ${day.date}` : ''
      const attractionsInfo = ` (${day.attractions.length} ${day.attractions.length === 1 ? 'atração' : 'atrações'})`

      // Número do dia com ícone
      const dotX = x + 3
      const dotY = yPos - 1.5
      pdf.setFillColor(...this.PRIMARY_COLOR)
      pdf.circle(dotX, dotY, 0.8, 'F')

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(7)
      pdf.setFont('Arial', 'bold')
      pdf.text(day.dayNumber.toString(), dotX - 0.25, dotY + 0.8)

      // Informações do dia
      pdf.setTextColor(...this.DEFAULT_COLOR)
      pdf.setFontSize(10)
      pdf.setFont('Arial', 'normal')
      pdf.text(`${dayInfo}${dateInfo}${attractionsInfo}`, x + 10, yPos)

      // Lista resumida de atrações
      if (day.attractions.length > 0 && day.attractions.length <= 4) {
        pdf.setFontSize(8)
        pdf.setTextColor(...this.TEXT_LIGHT)
        pdf.setFont('Arial', 'normal')
        
        const attractionNames = day.attractions
          .slice(0, 3)
          .map(a => a.name)
          .join(', ')
        
        const moreInfo = day.attractions.length > 3 ? ` +${day.attractions.length - 3} mais` : ''
        pdf.text(`   • ${attractionNames}${moreInfo}`, x + 10, yPos + 4)
        yPos += 8
      } else {
        yPos += 5
      }
    })
  }

  /**
   * Header do dia com resumo - MELHORADO
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // @ts-expect-error Legacy method kept for compatibility
  private _addDayHeader(
    pdf: jsPDF,
    daySchedule: DaySchedule,
    _trip: Trip,
    x: number,
    y: number,
    _width: number,
    pageWidth: number,
    _pageHeight: number
  ): number {
    // Background gradiente - azul vibrante com sombra
    pdf.setFillColor(...this.PRIMARY_COLOR)
    pdf.rect(0, y - 2, pageWidth, 22, 'F')

    // Dia número em grande
    pdf.setFontSize(36)
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('Arial', 'bold')
    pdf.text(`DIA ${daySchedule.dayNumber}`, x, y + 11)

    // Data (se disponível)
    if (daySchedule.date) {
      pdf.setFontSize(12)
      pdf.setTextColor(220, 230, 255)
      pdf.setFont('Arial', 'normal')
      pdf.text(`📅 ${daySchedule.date}`, pageWidth - x - 10, y + 11, { align: 'right' })
    }

    // Linha separadora decorativa
    pdf.setDrawColor(255, 255, 255)
    pdf.setLineWidth(0.6)
    pdf.line(x, y + 16, pageWidth - x, y + 16)

    return y + 26
  }

  /**
   * Atrações do dia com formatação melhorada
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // @ts-expect-error Legacy method kept for compatibility
  private _addDayAttractions(
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
      pdf.setFont('Arial', 'italic')
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
      pdf.circle(dotX, dotY, 1.5, 'F')

      // Vertical line connecting to next
      if (!isLast) {
        pdf.setDrawColor(...this.PRIMARY_COLOR)
        pdf.setLineWidth(0.6)
        pdf.line(dotX, dotY + 1.5, dotX, y + 28)
      }

      // Card background com borda
      pdf.setFillColor(255, 255, 255)
      pdf.setDrawColor(...this.BORDER_COLOR)
      pdf.setLineWidth(0.3)
      pdf.rect(x + 8, y - 1, width - 8, 1, 'F')

      const contentX = x + 12
      let lineY = y + 2

      // ⏰ HORÁRIO - bem visível
      pdf.setFontSize(13)
      pdf.setTextColor(...this.DANGER_COLOR)
      pdf.setFont('Arial', 'bold')
      pdf.text(`${attraction.time || '--:--'}`, contentX, lineY + 3)

      // 📍 NOME - destaque principal
      pdf.setFontSize(11)
      pdf.setTextColor(...this.DEFAULT_COLOR)
      pdf.setFont('Arial', 'bold')
      const nameX = contentX + 20
      const nameWidth = width - 30
      const splitName = pdf.splitTextToSize(attraction.name, nameWidth)
      pdf.text(splitName, nameX, lineY + 3)
      lineY += Math.max(5, splitName.length * 4) + 3

      // 📝 RAZÃO/DESCRIÇÃO
      if (attraction.reason) {
        pdf.setFontSize(9)
        pdf.setTextColor(...this.TEXT_LIGHT)
        pdf.setFont('Arial', 'normal')
        const splitReason = pdf.splitTextToSize(attraction.reason, nameWidth - 2)
        pdf.text(splitReason, contentX + 2, lineY + 1)
        lineY += splitReason.length * 3.3 + 2
      }

      // 📍 ENDEREÇO - se disponível
      if (attraction.location?.address) {
        pdf.setFontSize(8)
        pdf.setTextColor(110, 110, 110)
        pdf.setFont('Arial', 'normal')
        const splitAddr = pdf.splitTextToSize(`📍 ${attraction.location.address}`, nameWidth - 2)
        pdf.text(splitAddr, contentX + 2, lineY + 1)
        lineY += splitAddr.length * 2.9 + 1
      }

      // 🗺️ COORDENADAS GPS - compacto
      if (attraction.location?.lat && attraction.location?.lng) {
        pdf.setFontSize(7)
        pdf.setTextColor(145, 145, 145)
        pdf.setFont('Arial', 'normal')
        const coords = `🗺️ ${attraction.location.lat.toFixed(4)}, ${attraction.location.lng.toFixed(4)}`
        pdf.text(coords, contentX + 2, lineY + 1)
        lineY += 2.8
      }

      // Detalhes adicionais em uma linha
      const detailsLine: string[] = []
      if (attraction.duration) {
        detailsLine.push(`⏱️ ${attraction.duration} min`)
      }

      if (detailsLine.length > 0) {
        pdf.setFontSize(8)
        pdf.setTextColor(...this.ACCENT_COLOR)
        pdf.setFont('Arial', 'normal')
        pdf.text(detailsLine.join(' • '), contentX + 2, lineY + 2)
        lineY += 3
      }

      // 💡 DICAS - em destaque suave
      if (attraction.tip) {
        pdf.setFillColor(255, 248, 220)
        pdf.setDrawColor(255, 200, 80)
        pdf.setLineWidth(0.4)
        pdf.rect(contentX - 2, lineY + 1, nameWidth + 4, 5, 'FD')

        pdf.setFontSize(8)
        pdf.setTextColor(150, 100, 20)
        pdf.setFont('Arial', 'normal')
        const splitTip = pdf.splitTextToSize(`💡 ${attraction.tip}`, nameWidth - 3)
        pdf.text(splitTip, contentX, lineY + 3)
        lineY += splitTip.length * 2.9 + 2
      }

      // 📝 NOTAS ADICIONAIS
      if (attraction.notes) {
        pdf.setFillColor(220, 238, 255)
        pdf.setDrawColor(100, 150, 255)
        pdf.setLineWidth(0.4)
        pdf.rect(contentX - 2, lineY + 1, nameWidth + 4, 5, 'FD')

        pdf.setFontSize(8)
        pdf.setTextColor(30, 80, 150)
        pdf.setFont('Arial', 'normal')
        const splitNotes = pdf.splitTextToSize(`📝 ${attraction.notes}`, nameWidth - 3)
        pdf.text(splitNotes, contentX, lineY + 3)
        lineY += splitNotes.length * 2.9 + 2
      }

      // Espaço entre atrações
      y = lineY + 7
    }

    return y
  }

  /**
   * Footer da página
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // @ts-expect-error Legacy method kept for compatibility
  private _addPageFooter(
    pdf: jsPDF,
    pageNumber: number,
    totalPages: number,
    pageWidth: number,
    pageHeight: number,
    margin: number
  ): void {
    const footerY = pageHeight - 8

    // Line separadora
    pdf.setDrawColor(...this.PRIMARY_COLOR)
    pdf.setLineWidth(0.5)
    pdf.line(margin, footerY - 2, pageWidth - margin, footerY - 2)

    // Left: Generated date
    pdf.setFontSize(8)
    pdf.setTextColor(...this.TEXT_LIGHT)
    pdf.setFont('Arial', 'normal')
    pdf.text(
      `📋 Gerado em ${new Date().toLocaleDateString('pt-BR')} | Pocket Guide`,
      margin,
      footerY
    )

    // Right: Page number
    pdf.setFontSize(8)
    pdf.setTextColor(...this.TEXT_LIGHT)
    pdf.text(
      `Página ${pageNumber}/${totalPages}`,
      pageWidth - margin - 18,
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

    console.log('🔍 Procurando atrações no trip:', {
      hasAttractions: !!trip.attractions,
      attractionsLength: trip.attractions?.length || 0,
      hasItinerary: !!trip.itinerary,
      itineraryType: typeof trip.itinerary,
      itineraryKeys: trip.itinerary ? Object.keys(trip.itinerary).slice(0, 5) : 'N/A',
    })

    // 1. Verificar trip.attractions direto
    if (trip.attractions && trip.attractions.length > 0) {
      console.log('📌 Atrações encontradas em trip.attractions:', trip.attractions.length)
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
          console.log('✅ Itinerário parseado com sucesso')
        } catch (error) {
          console.error('❌ Erro ao fazer parse do itinerary:', error)
          itinerary = {}
        }
      }

      console.log('🔍 Estrutura do itinerário:', {
        hasItineraryField: !!itinerary.itinerary,
        hasDays: !!itinerary.days,
        hasAttractions: !!itinerary.attractions,
        keys: Object.keys(itinerary).slice(0, 10),
      })

      // 🔧 SUPORTE A DUPLA ENCAPSULAÇÃO: { itinerary: { itinerary: [...] } }
      // Quando vem do CreateTripScreen, pode estar encapsulado duas vezes
      if (itinerary.itinerary && Array.isArray(itinerary.itinerary)) {
        console.log(`📌 Detectada DUPLA ENCAPSULAÇÃO: itinerary.itinerary com ${itinerary.itinerary.length} items`)
        attractions = itinerary.itinerary
      }
      // Extrair atrações do itinerário
      else if (itinerary.days && Array.isArray(itinerary.days)) {
        // Formato: { days: [{ attractions: [...] }] }
        console.log(`📌 Itinerário com ${itinerary.days.length} dias`)
        
        itinerary.days.forEach((day: any, dayIndex: number) => {
          if (day.attractions && Array.isArray(day.attractions)) {
            console.log(`   Dia ${dayIndex + 1}: ${day.attractions.length} atrações`)
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
        console.log(`📌 Itinerário com array flat de ${itinerary.attractions.length} atrações`)
        attractions = itinerary.attractions
      } else if (Array.isArray(itinerary)) {
        // Formato direto: array de ItineraryItem (vindo de generateItinerary)
        console.log(`📌 Itinerário é um array direto com ${itinerary.length} items (ItineraryItem format)`)
        // Converter ItineraryItem para Attraction
        attractions = itinerary.map((item: any) => ({
          id: item.id,
          name: item.name,
          reason: item.reason,
          time: item.time,
          duration: item.duration,
          tip: item.tip,
          day: item.day || 1,
          location: item.location,
          category: item.category,
        } as Attraction))
      } else {
        // Último recurso: procurar por qualquer campo que possa ter atrações
        console.log('🔍 Procurando em campos alternativos...')
        for (const [key, value] of Object.entries(itinerary)) {
          if (Array.isArray(value) && value.length > 0 && value[0]?.name) {
            console.log(`   Encontrado em itinerary.${key}: ${value.length} items`)
            attractions = value as Attraction[]
            break
          }
        }
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
    try {
      const start = new Date(startDate)
      if (isNaN(start.getTime())) {
        console.warn('⚠️ Start date inválida:', startDate)
        return `Dia ${dayNumber}`
      }
      const date = new Date(start.getTime() + (dayNumber - 1) * 24 * 60 * 60 * 1000)
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'short', 
        day: '2-digit', 
        month: '2-digit' 
      })
    } catch (error) {
      console.error('❌ Erro ao calcular data do dia:', error)
      return `Dia ${dayNumber}`
    }
  }

  /**
   * Calcula quantidade de dias
   */
  private calculateDays(startDate: Date | string, endDate: Date | string): string {
    try {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn('⚠️ Datas inválidas:', { startDate, endDate })
        return '0'
      }
      
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      return days.toString()
    } catch (error) {
      console.error('❌ Erro ao calcular dias:', error)
      return '0'
    }
  }

  /**
   * Label do tipo de viagem
   */
  private getTripTypeLabel(tripType?: string): string {
    const labels: Record<string, string> = {
      'relaxamento': '🏖️ Relaxamento',
      'aventura': '🏔️ Aventura',
      'cultura': '🏛️ Cultura',
      'diversao': '🎉 Diversão',
      'exploracao': '🗺️ Exploração',
      'romantica': '💑 Romântica',
      'gastronomia': '🍽️ Gastronomia',
      'natureza': '🌿 Natureza',
      'esportes': '⚽ Esportes',
      'bem-estar': '🧘 Bem-estar',
    }
    return labels[tripType || ''] || 'Viagem Geral'
  }

  /**
   * Label do orçamento
   */
  private getBudgetLabel(budget?: string): string {
    const labels: Record<string, string> = {
      'econômico': '💰 Econômico',
      'médio': '💰💰 Médio',
      'luxo': '💰💰💰 Luxo',
      'ultra-economico': '💰 Ultra Econômico',
      'medio': '💰💰 Médio',
      'premium': '💰💰💰 Premium',
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
