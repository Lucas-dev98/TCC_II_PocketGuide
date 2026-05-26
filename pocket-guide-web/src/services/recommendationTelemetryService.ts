import logger from './logger';

const STORAGE_KEY = 'recommendation_telemetry_v1';

interface RecommendationSnapshot {
  destination: string;
  score: number;
  rank: number;
}

interface RecommendationContext {
  tripTypes: string[];
  interests: string[];
  budget?: string;
  groupType?: string;
  tripScope?: string;
  season?: string;
  language?: string;
}

interface TelemetryRecord {
  timestamp: string;
  source: string;
  type: 'impression' | 'click';
  recommendations?: RecommendationSnapshot[];
  selected?: RecommendationSnapshot;
  context?: RecommendationContext;
}

interface RecommendationTelemetryState {
  impressions: number;
  displayedRecommendations: number;
  displayedScoreTotal: number;
  clicks: number;
  clickedScoreTotal: number;
  lastUpdatedAt: string;
  history: TelemetryRecord[];
}

export interface RecommendationTelemetrySummary {
  impressions: number;
  displayedRecommendations: number;
  clicks: number;
  averageDisplayedScore: number;
  averageClickedScore: number;
  clickThroughRate: number;
  lastUpdatedAt: string;
}

function getInitialState(): RecommendationTelemetryState {
  return {
    impressions: 0,
    displayedRecommendations: 0,
    displayedScoreTotal: 0,
    clicks: 0,
    clickedScoreTotal: 0,
    lastUpdatedAt: new Date().toISOString(),
    history: [],
  };
}

function loadState(): RecommendationTelemetryState {
  if (typeof window === 'undefined') {
    return getInitialState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getInitialState();
    }

    const parsed = JSON.parse(raw) as RecommendationTelemetryState;
    return {
      ...getInitialState(),
      ...parsed,
      history: Array.isArray(parsed.history) ? parsed.history.slice(-100) : [],
    };
  } catch (error) {
    logger.warn('Failed to load recommendation telemetry state', {
      error: error instanceof Error ? error.message : String(error),
    });
    return getInitialState();
  }
}

function saveState(state: RecommendationTelemetryState): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    logger.warn('Failed to save recommendation telemetry state', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toSummary(state: RecommendationTelemetryState): RecommendationTelemetrySummary {
  const averageDisplayedScore = state.displayedRecommendations > 0
    ? Number((state.displayedScoreTotal / state.displayedRecommendations).toFixed(2))
    : 0;

  const averageClickedScore = state.clicks > 0
    ? Number((state.clickedScoreTotal / state.clicks).toFixed(2))
    : 0;

  const clickThroughRate = state.displayedRecommendations > 0
    ? Number(((state.clicks / state.displayedRecommendations) * 100).toFixed(2))
    : 0;

  return {
    impressions: state.impressions,
    displayedRecommendations: state.displayedRecommendations,
    clicks: state.clicks,
    averageDisplayedScore,
    averageClickedScore,
    clickThroughRate,
    lastUpdatedAt: state.lastUpdatedAt,
  };
}

export function trackRecommendationImpression(
  source: string,
  recommendations: RecommendationSnapshot[],
  context?: RecommendationContext
): RecommendationTelemetrySummary {
  if (!recommendations.length) {
    return getRecommendationTelemetrySummary();
  }

  const safeRecommendations = recommendations.map((item) => ({
    ...item,
    score: clampScore(item.score),
  }));

  const state = loadState();
  state.impressions += 1;
  state.displayedRecommendations += safeRecommendations.length;
  state.displayedScoreTotal += safeRecommendations.reduce((sum, item) => sum + item.score, 0);
  state.lastUpdatedAt = new Date().toISOString();
  state.history.push({
    timestamp: state.lastUpdatedAt,
    source,
    type: 'impression',
    recommendations: safeRecommendations,
    context,
  });
  state.history = state.history.slice(-100);

  saveState(state);

  const summary = toSummary(state);
  logger.logEvent('recommendation_impression', {
    source,
    shown: safeRecommendations.length,
    averageDisplayedScore: summary.averageDisplayedScore,
    clickThroughRate: summary.clickThroughRate,
  });

  return summary;
}

export function trackRecommendationClick(
  source: string,
  selected: RecommendationSnapshot,
  context?: RecommendationContext
): RecommendationTelemetrySummary {
  const safeSelected = {
    ...selected,
    score: clampScore(selected.score),
  };

  const state = loadState();
  state.clicks += 1;
  state.clickedScoreTotal += safeSelected.score;
  state.lastUpdatedAt = new Date().toISOString();
  state.history.push({
    timestamp: state.lastUpdatedAt,
    source,
    type: 'click',
    selected: safeSelected,
    context,
  });
  state.history = state.history.slice(-100);

  saveState(state);

  const summary = toSummary(state);
  logger.logEvent('recommendation_click', {
    source,
    destination: safeSelected.destination,
    selectedScore: safeSelected.score,
    averageClickedScore: summary.averageClickedScore,
    clickThroughRate: summary.clickThroughRate,
  });

  return summary;
}

export function getRecommendationTelemetrySummary(): RecommendationTelemetrySummary {
  return toSummary(loadState());
}

export function resetRecommendationTelemetry(): void {
  saveState(getInitialState());
  logger.logEvent('recommendation_telemetry_reset');
}
