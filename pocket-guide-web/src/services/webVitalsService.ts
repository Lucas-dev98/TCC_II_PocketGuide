/**
 * Web Vitals Service (v5.x)
 * 
 * Monitora Core Web Vitals (2024):
 * - LCP (Largest Contentful Paint): Quando o maior elemento aparece
 * - INP (Interaction to Next Paint): Tempo de resposta a interações
 * - CLS (Cumulative Layout Shift): Quanto a página se desloca
 * - FCP (First Contentful Paint): Quando primeiro conteúdo aparece
 * - TTFB (Time to First Byte): Tempo do servidor responder
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals'
import { debug } from '../utils/debug'

export interface VitalMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta?: number
  id: string
  navigationType?: string
}

export interface VitalsReport {
  timestamp: number
  url: string
  metrics: {
    lcp?: VitalMetric
    inp?: VitalMetric
    cls?: VitalMetric
    fcp?: VitalMetric
    ttfb?: VitalMetric
  }
  deviceInfo: {
    userAgent: string
    connection?: string
  }
}

type VitalCallback = (report: VitalsReport) => void

class WebVitalsService {
  private metrics: Map<string, VitalMetric> = new Map()
  private callbacks: Set<VitalCallback> = new Set()

  constructor() {
    this.initializeVitals()
    this.setupConnectionInfo()
  }

  /**
   * Inicializa monitoramento de Web Vitals
   */
  private initializeVitals(): void {
    // LCP - Largest Contentful Paint
    onLCP((metric: Metric) => this.handleMetric('lcp', metric))

    // INP - Interaction to Next Paint (substitui FID)
    onINP((metric: Metric) => this.handleMetric('inp', metric))

    // CLS - Cumulative Layout Shift
    onCLS((metric: Metric) => this.handleMetric('cls', metric))

    // FCP - First Contentful Paint
    onFCP((metric: Metric) => this.handleMetric('fcp', metric))

    // TTFB - Time to First Byte
    onTTFB((metric: Metric) => this.handleMetric('ttfb', metric))
  }

  /**
   * Processa métrica recebida
   */
  private handleMetric(name: string, metric: Metric): void {
    const vitalMetric: VitalMetric = {
      name: this.getMetricLabel(name),
      value: Math.round(metric.value),
      rating: this.getRating(name, metric.value),
      delta: metric.delta ? Math.round(metric.delta) : undefined,
      id: metric.id,
      navigationType: metric.navigationType,
    }

    this.metrics.set(name, vitalMetric)

    // Log apenas se problema
    if (vitalMetric.rating !== 'good') {
      debug.warn(`⚠️ ${vitalMetric.name}: ${vitalMetric.value}ms (${vitalMetric.rating})`)
    } else {
      debug.log(`✅ ${vitalMetric.name}: ${vitalMetric.value}ms`)
    }

    // Notifica callbacks
    this.notifyCallbacks()
  }

  /**
   * Converte nome da métrica para label legível
   */
  private getMetricLabel(name: string): string {
    const labels: Record<string, string> = {
      lcp: 'Largest Contentful Paint',
      inp: 'Interaction to Next Paint',
      cls: 'Cumulative Layout Shift',
      fcp: 'First Contentful Paint',
      ttfb: 'Time to First Byte',
    }
    return labels[name] || name
  }

  /**
   * Avalia se a métrica está bem ou não (baseado em Google Lighthouse 2024)
   */
  private getRating(
    name: string,
    value: number
  ): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, [number, number]> = {
      lcp: [2500, 4000], // Good: <2.5s, Needs improvement: <4s, Poor: >4s
      inp: [200, 500], // Good: <200ms, Needs improvement: <500ms, Poor: >500ms
      cls: [0.1, 0.25], // Good: <0.1, Needs improvement: <0.25, Poor: >0.25
      fcp: [1800, 3000], // Good: <1.8s, Needs improvement: <3s, Poor: >3s
      ttfb: [600, 1200], // Good: <600ms, Needs improvement: <1.2s, Poor: >1.2s
    }

    const [goodThreshold, needsImprovementThreshold] = thresholds[name] || [
      Infinity,
      Infinity,
    ]

    if (value <= goodThreshold) return 'good'
    if (value <= needsImprovementThreshold) return 'needs-improvement'
    return 'poor'
  }

  /**
   * Configura informações de conexão
   */
  private setupConnectionInfo(): void {
    try {
      const connection = (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection

      if (connection) {
        debug.log(`Connection: ${connection.effectiveType}, RTT: ${connection.rtt}ms`)
      }
    } catch (error) {
      // Silenciosamente falha se não disponível
    }
  }

  /**
   * Retorna relatório completo de Web Vitals
   */
  public getReport(): VitalsReport {
    const metrics: Record<string, VitalMetric> = {}

    this.metrics.forEach((metric, name) => {
      metrics[name] = metric
    })

    return {
      timestamp: Date.now(),
      url: window.location.href,
      metrics: metrics as any,
      deviceInfo: {
        userAgent: navigator.userAgent,
        connection: (navigator as any).connection?.effectiveType,
      },
    }
  }

  /**
   * Retorna métrica específica
   */
  public getMetric(name: string): VitalMetric | undefined {
    return this.metrics.get(name.toLowerCase())
  }

  /**
   * Retorna todas as métricas
   */
  public getAllMetrics(): Map<string, VitalMetric> {
    return new Map(this.metrics)
  }

  /**
   * Verifica se todas as métricas estão "good"
   */
  public allMetricsGood(): boolean {
    for (const metric of this.metrics.values()) {
      if (metric.rating !== 'good') {
        return false
      }
    }
    return true
  }

  /**
   * Retorna contagem de cada avaliação
   */
  public getMetricsSummary() {
    const summary = { good: 0, 'needs-improvement': 0, poor: 0 }

    this.metrics.forEach((metric) => {
      summary[metric.rating]++
    })

    return summary
  }

  /**
   * Subscribe para mudanças de métricas
   */
  public onMetricsUpdate(callback: VitalCallback): () => void {
    this.callbacks.add(callback)
    // Retorna função para unsubscribe
    return () => this.callbacks.delete(callback)
  }

  /**
   * Notifica todos os callbacks
   */
  private notifyCallbacks(): void {
    const report = this.getReport()
    this.callbacks.forEach((callback) => {
      try {
        callback(report)
      } catch (error) {
        debug.error('Erro em callback de Web Vitals:', error)
      }
    })
  }

  /**
   * Envia métricas para servidor (Analytics)
   */
  public async sendToAnalytics(endpoint: string): Promise<void> {
    try {
      const report = this.getReport()

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
        keepalive: true, // Importante para enviar mesmo se página fechar
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      debug.log('Web Vitals enviados para analytics')
    } catch (error) {
      debug.error('Erro ao enviar Web Vitals:', error)
    }
  }

  /**
   * Retorna status geral baseado em métricas
   */
  public getOverallScore(): 'excellent' | 'good' | 'needs-work' {
    const summary = this.getMetricsSummary()

    if (summary.poor > 0) return 'needs-work'
    if (summary['needs-improvement'] > 0) return 'good'
    return 'excellent'
  }
}

// Singleton
export const webVitalsService = new WebVitalsService()
