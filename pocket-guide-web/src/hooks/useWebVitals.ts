/**
 * useWebVitals Hook
 * 
 * Hook para monitorar Web Vitals em componentes
 */

import { useEffect, useState } from 'react'
import { webVitalsService, VitalsReport, VitalMetric } from '../services/webVitalsService'

export const useWebVitals = () => {
  const [report, setReport] = useState<VitalsReport>(webVitalsService.getReport())
  const [overallScore, setOverallScore] = useState(webVitalsService.getOverallScore())

  useEffect(() => {
    // Subscribe para mudanças de métricas
    const unsubscribe = webVitalsService.onMetricsUpdate((newReport) => {
      setReport(newReport)
      setOverallScore(webVitalsService.getOverallScore())
    })

    return unsubscribe
  }, [])

  return {
    report,
    metrics: webVitalsService.getAllMetrics(),
    overallScore,
    summary: webVitalsService.getMetricsSummary(),
    allGood: webVitalsService.allMetricsGood(),
    sendToAnalytics: (endpoint: string) => webVitalsService.sendToAnalytics(endpoint),
    getMetric: (name: string): VitalMetric | undefined => webVitalsService.getMetric(name),
  }
}
