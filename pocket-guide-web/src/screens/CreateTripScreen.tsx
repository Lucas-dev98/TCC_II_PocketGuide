import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import useI18n from '../hooks/useI18n'
import { useTripsStore } from '../store/tripsStore'
import { useToast } from '../components/Toast'
import { Button } from '../components/Button'
import { LoadingOverlay } from '../components/LoadingOverlay'
import { MainLayout } from '../components/Layout'
import { generateItinerary } from '../services/itineraryGenerator'
import {
  generateItineraryInBackend,
  generateItineraryJobInBackend,
  getItineraryJobStatus,
  isBackendApiEnabled,
  mapBackendErrorToUserMessage,
} from '../services/backendApi'
import { getUserLocation } from '../services/userLocationService'
import { TripScopeSelector } from '../components/TripScopeSelector'
import { TravelTypeSelector } from '../components/TravelTypeSelector'
import { DurationAndBudgetSelector } from '../components/DurationAndBudgetSelector'
import { GroupCompositionSelector } from '../components/GroupCompositionSelector'
import { DestinationSelector } from '../components/DestinationSelector'
import { InterestsSelector } from '../components/InterestsSelector'
import { TripPreview } from '../components/TripPreview'
import { TripSuccess } from '../components/TripSuccess'
import { TripType, BudgetPerDay, GroupType, Trip } from '../types'
import { TRAVEL_TYPES_ARRAY } from '../constants/travelTypes'
import { ArrowLeft } from 'lucide-react'
import i18n from 'i18next'
import { debug } from '../utils/debug'

/**
 * CreateTripScreen - Simplified Trip Creation Flow
 * 
 * Flow (Simplified Order):
 * Step 1: Trip Scope - Select nacional or internacional
 * Step 2: Travel Type + Interests - Select trip type and interests together
 * Step 3: Group Composition + Budget - Select group type, number of people, and daily budget
 * Step 4: Duration + Dates - Select travel dates
 * Step 5: Destination - Select destination
 * Step 6: Trip Preview - Review all trip details
 * Step 7: Trip Success - Confirmation and next steps
 */

interface TripFormData {
  tripScope: 'nacional' | 'internacional' | '';
  tripTypes: TripType[];
  budgetPerDay: BudgetPerDay;
  useCustomBudgetRange?: boolean;
  budgetMinPerDay?: number;
  budgetMaxPerDay?: number;
  budgetCurrency?: string;
  groupType: GroupType;
  numPeople?: number;
  numChildren?: number;
  travelMonth: string;
  planningMode?: 'dates' | 'season';
  startDate: string;
  endDate: string;
  season?: 'primavera' | 'verão' | 'outono' | 'inverno';
  destination: string;
  interests: string[];
}

type StepType = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const BUDGET_BASE_RANGES: Record<BudgetPerDay, { min: number; max: number }> = {
  'ultra-economico': { min: 50, max: 120 },
  economico: { min: 120, max: 250 },
  medio: { min: 250, max: 500 },
  premium: { min: 500, max: 1000 },
  luxo: { min: 1000, max: 2500 },
}

const calculateBudgetByGroup = (
  budgetPerDay: BudgetPerDay,
  groupType: GroupType,
  numPeople?: number
): { min: number; max: number } => {
  const base = BUDGET_BASE_RANGES[budgetPerDay]
  const people = Math.max(1, numPeople || (groupType === 'casal' ? 2 : 1))
  const factor = groupType === 'solo' ? 1 : groupType === 'casal' ? 1.7 : Math.max(1.5, people * 0.8)

  return {
    min: Math.round(base.min * factor),
    max: Math.round(base.max * factor),
  }
}

const buildSeasonDateRange = (season?: 'primavera' | 'verão' | 'outono' | 'inverno') => {
  const now = new Date()
  const year = now.getFullYear()

  const seasonStartMap: Record<string, { month: number; day: number }> = {
    primavera: { month: 8, day: 23 },
    verão: { month: 11, day: 21 },
    outono: { month: 2, day: 20 },
    inverno: { month: 5, day: 21 },
  }

  const selected = seasonStartMap[season || 'primavera'] || seasonStartMap.primavera
  const start = new Date(year, selected.month, selected.day)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    durationDays: 7,
  }
}

const inferRecommendationMonth = (
  startDate?: string,
  season?: 'primavera' | 'verão' | 'outono' | 'inverno',
  tripScope?: 'nacional' | 'internacional' | ''
): number | undefined => {
  if (startDate) {
    const parsed = new Date(startDate)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.getMonth() + 1
    }
  }

  // For domestic trips in Brazil, season can be mapped to southern hemisphere months.
  if (tripScope === 'nacional' && season) {
    const seasonMonth: Record<'primavera' | 'verão' | 'outono' | 'inverno', number> = {
      primavera: 10,
      verão: 1,
      outono: 4,
      inverno: 7,
    }
    return seasonMonth[season]
  }

  return undefined
}

export default function CreateTripScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useI18n()
  const { addTrip, loadTrips } = useTripsStore()
  const { showError, showSuccess } = useToast()

  const [step, setStep] = useState<StepType>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState(
    t('createTrip.generatingItinerary') || 'Generating itinerary...'
  )
  const [createdTripId, setCreatedTripId] = useState<string>('')
  const [userLocation, setUserLocation] = useState<any>(null)

  const [formData, setFormData] = useState<TripFormData>({
    tripScope: '',
    tripTypes: [],
    budgetPerDay: 'medio',
    useCustomBudgetRange: false,
    budgetMinPerDay: BUDGET_BASE_RANGES.medio.min,
    budgetMaxPerDay: BUDGET_BASE_RANGES.medio.max,
    budgetCurrency: 'BRL',
    groupType: 'casal',
    travelMonth: '6',
    planningMode: 'dates',
    startDate: '',
    endDate: '',
    season: 'primavera',
    destination: '',
    interests: [],
  })

  // Get user location on component mount
  useEffect(() => {
    const fetchUserLocation = async () => {
      debug.log('📍 Fetching user location...')
      const location = await getUserLocation()
      if (location) {
        debug.log('✅ User location obtained:', location)
        debug.log('📍 Address:', location.address)
        debug.log('📍 Coordinates:', { lat: location.lat, lng: location.lng })
        setUserLocation(location)
      } else {
        debug.warn('⚠️ Could not obtain user location')
      }
    }
    fetchUserLocation()
  }, [])

  // Monitor userLocation changes
  useEffect(() => {
    debug.log('🔍 userLocation state changed:', {
      hasLocation: !!userLocation,
      address: userLocation?.address || 'none',
      lat: userLocation?.lat,
      lng: userLocation?.lng,
    })
  }, [userLocation])

  const handleGoBack = () => {
    if (step === 1) {
      navigate('/home')
    } else {
      setStep((step - 1) as StepType)
    }
  }

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        // Step 1: Trip Scope - required
        if (!formData.tripScope) {
          showError(t('createTrip.selectTripScope') || 'Please select trip scope')
          return false
        }
        return true

      case 2:
        // Step 2: Trip Type + Interests - required
        if (formData.tripTypes.length === 0) {
          showError(t('createTrip.selectTravelType') || 'Please select at least one travel type')
          return false
        }
        if (formData.interests.length === 0) {
          showError(t('createTrip.selectInterests') || 'Please select at least one interest')
          return false
        }
        return true

      case 3:
        // Step 3: Group Composition + Budget Selection - required
        if (!formData.groupType) {
          showError(t('createTrip.selectGroupType') || 'Please select a group type')
          return false
        }
        if (!formData.budgetPerDay) {
          showError(t('createTrip.selectBudget') || 'Please select a budget')
          return false
        }
        if (
          formData.useCustomBudgetRange &&
          formData.budgetMinPerDay !== undefined &&
          formData.budgetMaxPerDay !== undefined &&
          formData.budgetMinPerDay > formData.budgetMaxPerDay
        ) {
          showError(t('createTrip.invalidBudgetRange') || 'O valor minimo do orcamento nao pode ser maior que o maximo')
          return false
        }
        return true

      case 4:
        // Step 4: Dates + Month - required
        if (formData.planningMode === 'season') {
          if (!formData.season) {
            showError(t('createTrip.selectSeason') || 'Please select a season')
            return false
          }
        } else {
          if (!formData.startDate) {
            showError(t('createTrip.selectStartDate') || 'Please select a start date')
            return false
          }
          if (!formData.endDate) {
            showError(t('createTrip.selectEndDate') || 'Please select an end date')
            return false
          }
        }
        return true

      case 5:
        // Step 5: Destination - required
        if (!formData.destination.trim()) {
          showError(t('createTrip.selectDestination') || 'Please select a destination')
          return false
        }
        return true

      case 6:
        // Step 6: Preview - always allowed
        return true

      case 7:
        // Step 7: Success - always allowed
        return true

      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep()) {
      if (step < 7) {
        setStep((step + 1) as StepType)
      }
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep((step - 1) as StepType)
    }
  }

  const pollItineraryJob = async (jobId: string) => {
    const maxPollAttempts = 45
    const pollIntervalMs = 2000

    for (let attempt = 1; attempt <= maxPollAttempts; attempt++) {
      const status = await getItineraryJobStatus(jobId)

      if (status.status === 'queued') {
        setLoadingMessage(t('createTrip.itineraryQueued') || 'Itinerary queued. Preparing generation...')
      }

      if (status.status === 'running') {
        setLoadingMessage(
          t('createTrip.itineraryRunning') ||
            `Generating itinerary with AI... (${attempt}/${maxPollAttempts})`
        )
      }

      if (status.status === 'completed') {
        setLoadingMessage(t('createTrip.itineraryCompleted') || 'Itinerary generated successfully.')
        return status.result?.items || []
      }

      if (status.status === 'failed') {
        throw new Error(status.error || 'Itinerary generation failed')
      }

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
    }

    throw new Error('Timeout while waiting for itinerary job completion')
  }

  const handleSubmit = async () => {
    if (!user?.uid) {
      showError(t('createTrip.userNotFound') || 'User not found')
      return
    }

    try {
      setIsLoading(true)
      setLoadingMessage(t('createTrip.generatingItinerary') || 'Generating itinerary...')

      debug.log('🚀 Starting trip creation process...')
      debug.log('📊 Form data:', formData)
      debug.log('👤 User ID:', user.uid)

      // Calculate duration from dates
      const resolvedDates =
        formData.planningMode === 'season'
          ? buildSeasonDateRange(formData.season)
          : {
              startDate: formData.startDate,
              endDate: formData.endDate,
              durationDays: Math.max(
                1,
                Math.ceil(
                  (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              ),
            }

      let durationDays = resolvedDates.durationDays

      debug.log('📅 Duration:', durationDays, 'days')

      const defaultRange = calculateBudgetByGroup(
        formData.budgetPerDay,
        formData.groupType,
        formData.numPeople
      )

      const minPerDay =
        formData.budgetMinPerDay !== undefined ? formData.budgetMinPerDay : defaultRange.min
      const maxPerDay =
        formData.budgetMaxPerDay !== undefined ? formData.budgetMaxPerDay : defaultRange.max

      const budgetContext = {
        minPerDay,
        maxPerDay,
        currency: formData.budgetCurrency || 'BRL',
        travelers: formData.numPeople || (formData.groupType === 'casal' ? 2 : 1),
      }

      // Generate AI itinerary with timeout fallback
      let itinerary = []
      try {
        debug.log('⏳ Generating itinerary...')
        const currentLanguage = (i18n.language || 'pt-BR') as 'pt-BR' | 'en-US' | 'es-ES'

        if (isBackendApiEnabled()) {
          const basePayload = {
            destination: formData.destination,
            days: durationDays,
            tags: formData.interests,
            budget: formData.budgetPerDay,
            language: currentLanguage,
            groupType: formData.groupType,
            season: formData.season,
            tripScope: formData.tripScope,
            budgetMinPerDay: budgetContext.minPerDay,
            budgetMaxPerDay: budgetContext.maxPerDay,
            budgetCurrency: budgetContext.currency,
            travelers: budgetContext.travelers,
          }

          try {
            const asyncResponse = await generateItineraryJobInBackend(basePayload)

            if (asyncResponse.queued && asyncResponse.jobId) {
              itinerary = await pollItineraryJob(asyncResponse.jobId)
            } else {
              itinerary = asyncResponse.items || []
            }
          } catch (asyncError) {
            console.warn('⚠️ Async itinerary job failed, trying sync backend generation:', asyncError)
            itinerary = await generateItineraryInBackend(basePayload)
          }
        } else {
          // Add timeout to prevent hanging
          const itineraryPromise = generateItinerary(
            formData.destination,
            durationDays,
            formData.interests,
            formData.budgetPerDay,
            formData.groupType,
            currentLanguage,
            formData.season,
            formData.tripScope,
            userLocation,
            budgetContext
          )

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Itinerary generation timeout')), 60000)
          )

          itinerary = (await Promise.race([itineraryPromise, timeoutPromise])) as any
        }

        debug.log('✅ Itinerary generated:', itinerary?.length || 0, 'items')
      } catch (itineraryError) {
        debug.warn('⚠️ Primary itinerary generation failed, trying local fallback:', itineraryError)
        setLoadingMessage(t('createTrip.itineraryFallback') || 'Primary generation failed. Trying fallback...')

        const currentLanguage = (i18n.language || 'pt-BR') as 'pt-BR' | 'en-US' | 'es-ES'
        try {
          const fallbackItinerary = await generateItinerary(
            formData.destination,
            durationDays,
            formData.interests,
            formData.budgetPerDay,
            formData.groupType,
            currentLanguage,
            formData.season,
            formData.tripScope,
            userLocation,
            budgetContext
          )

          itinerary = fallbackItinerary || []
          debug.log('✅ Fallback itinerary generated:', itinerary?.length || 0, 'items')
        } catch (fallbackError) {
          debug.error('❌ Fallback itinerary generation also failed:', fallbackError)
          throw new Error(t('createTrip.errorItineraryRequired') || 'Não foi possível gerar o itinerário. Tente novamente.')
        }
      }

      if (!Array.isArray(itinerary) || itinerary.length === 0) {
        throw new Error(t('createTrip.errorItineraryRequired') || 'Não foi possível gerar o itinerário. Tente novamente.')
      }

      setLoadingMessage(t('createTrip.creatingTrip') || 'Creating trip...')

      // Create trip data with itinerary
        // ID is generated by the backend repository and returned in the API response.
      const tripData: Trip = {
        id: '', // Will be set by Firestore
        userId: user.uid,
        destination: formData.destination,
        country: formData.destination,
        startDate: resolvedDates.startDate,
        endDate: resolvedDates.endDate,
        tripType: formData.tripTypes[0] || TRAVEL_TYPES_ARRAY[0],
        budgetPerDay: formData.budgetPerDay,
        budgetMinPerDay: budgetContext.minPerDay,
        budgetMaxPerDay: budgetContext.maxPerDay,
        estimatedTotalBudgetMin: budgetContext.minPerDay * durationDays,
        estimatedTotalBudgetMax: budgetContext.maxPerDay * durationDays,
        budgetCurrency: budgetContext.currency,
        groupType: formData.groupType,
        travelMonth: formData.travelMonth,
        tripScope: formData.tripScope,
        interests: formData.interests,
        itinerary: itinerary || [], // Ensure itinerary is always an array
        createdAt: new Date().toISOString(),
      } as Trip

      debug.log('📝 Final trip data to save:', {
        userId: tripData.userId,
        destination: tripData.destination,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        budgetPerDay: tripData.budgetPerDay,  // ✅ ADICIONADO
        groupType: tripData.groupType,        // ✅ ADICIONADO
        tripScope: tripData.tripScope,        // ✅ ADICIONADO
        hasItinerary: !!(tripData.itinerary && tripData.itinerary.length > 0),
      })

      // Save trip and get ID
      debug.log('💾 Calling addTrip...')
      const tripId = await addTrip(tripData)
      debug.log('✅ Trip saved with ID:', tripId)
      
      setCreatedTripId(tripId)

      showSuccess(t('createTrip.tripCreatedSuccess') || 'Trip created successfully!')
      
      // IMPORTANTE: Recarregar trips imediatamente após criar
      debug.log('🔄 Reloading trips immediately after creation...')
      await loadTrips(user.uid)
      debug.log('✅ Trips reloaded')
      
      setStep(7)
    } catch (err) {
      console.error('❌ Error creating trip:', err)
      console.error('Error details:', err instanceof Error ? err.stack : err)
      const friendlyError = mapBackendErrorToUserMessage(err)
      showError(
        friendlyError || t('createTrip.errorCreating') || 'Error creating trip'
      )
    } finally {
      setIsLoading(false)
      setLoadingMessage(t('createTrip.generatingItinerary') || 'Generating itinerary...')
    }
  }

  const previewDates =
    formData.planningMode === 'season'
      ? buildSeasonDateRange(formData.season)
      : null

  const tripForPreview: Trip | null = formData.destination ? {
    id: 'preview',
    userId: user?.uid || '',
    destination: formData.destination,
    country: formData.destination,
    startDate:
      formData.startDate ||
      previewDates?.startDate ||
      new Date().toISOString().split('T')[0],
    endDate:
      formData.endDate ||
      previewDates?.endDate ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tripType: formData.tripTypes[0] || TRAVEL_TYPES_ARRAY[0],
    budgetPerDay: formData.budgetPerDay,
    budgetMinPerDay: formData.budgetMinPerDay,
    budgetMaxPerDay: formData.budgetMaxPerDay,
    budgetCurrency: formData.budgetCurrency,
    groupType: formData.groupType,
    travelMonth: formData.travelMonth,
    tripScope: formData.tripScope || undefined,
    interests: formData.interests,
    createdAt: new Date().toISOString(),
  } : null

  // DEBUG: Log budget value for TripPreview
  debug.log('🎯 CreateTripScreen - tripForPreview.budgetPerDay:', tripForPreview?.budgetPerDay);
  debug.log('🎯 CreateTripScreen - formData.budgetPerDay:', formData.budgetPerDay);

  const recommendationMonth = inferRecommendationMonth(
    formData.startDate,
    formData.season,
    formData.tripScope
  )

  return (
    <MainLayout>
      <LoadingOverlay
        isVisible={isLoading}
        message={loadingMessage}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 pb-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleGoBack}
              type="button"
              className="flex items-center gap-2 text-primary hover:text-primary-dark dark:hover:text-blue-300 mb-4 font-medium transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded"
              aria-label={t('common.back') || 'Back'}
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              {t('common.back') || 'Back'}
            </button>

            <h1 className="text-h1 font-bold text-slate-900 dark:text-white mb-2">
              {t('createTrip.title') || 'Create Your Trip'}
            </h1>

            <p className="text-body text-slate-600 dark:text-slate-300">
              {t('createTrip.subtitle') || 'Plan your perfect journey step by step'}
            </p>
          </div>

          {/* Progress bar */}
          <div
            className="mb-8 flex gap-2"
            role="progressbar"
            aria-label={`Step ${step} of 7`}
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={7}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition ${
                  s <= step
                    ? 'bg-primary dark:bg-blue-400'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Steps */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-8">
            {/* Step 1: Trip Scope Selector */}
            {step === 1 && (
              <TripScopeSelector
                value={formData.tripScope as 'nacional' | 'internacional' | ''}
                onChange={(scope: 'nacional' | 'internacional') =>
                  setFormData((prev) => ({ ...prev, tripScope: scope }))
                }
              />
            )}

            {/* Step 2: Travel Type + Interests */}
            {step === 2 && (
              <div className="space-y-8">
                <TravelTypeSelector
                  selected={formData.tripTypes}
                  onChange={(types: TripType[]) =>
                    setFormData((prev) => ({ ...prev, tripTypes: types }))
                  }
                />
                
                {formData.tripTypes.length > 0 && (
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
                    <InterestsSelector
                      tripTypes={formData.tripTypes}
                      selectedInterests={formData.interests}
                      onInterestsChange={(interests) =>
                        setFormData((prev) => ({ ...prev, interests }))
                      }
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Group Composition + Budget Selection */}
            {step === 3 && (
              <GroupCompositionSelector
                selectedGroup={formData.groupType}
                numPeople={formData.numPeople}
                numChildren={formData.numChildren}
                budgetPerDay={formData.budgetPerDay}
                budgetMinPerDay={formData.budgetMinPerDay}
                budgetMaxPerDay={formData.budgetMaxPerDay}
                onGroupChange={(groupType) =>
                  setFormData((prev) => {
                    if (prev.useCustomBudgetRange) {
                      return { ...prev, groupType }
                    }

                    const suggested = calculateBudgetByGroup(
                      prev.budgetPerDay,
                      groupType,
                      prev.numPeople
                    )

                    return {
                      ...prev,
                      groupType,
                      budgetMinPerDay: suggested.min,
                      budgetMaxPerDay: suggested.max,
                    }
                  })
                }
                onNumPeopleChange={(numPeople) =>
                  setFormData((prev) => {
                    if (prev.useCustomBudgetRange) {
                      return { ...prev, numPeople }
                    }

                    const suggested = calculateBudgetByGroup(
                      prev.budgetPerDay,
                      prev.groupType,
                      numPeople
                    )

                    return {
                      ...prev,
                      numPeople,
                      budgetMinPerDay: suggested.min,
                      budgetMaxPerDay: suggested.max,
                    }
                  })
                }
                onNumChildrenChange={(numChildren) =>
                  setFormData((prev) => ({ ...prev, numChildren }))
                }
                onBudgetChange={(budgetPerDay) => {
                  const suggested = calculateBudgetByGroup(
                    budgetPerDay,
                    formData.groupType,
                    formData.numPeople
                  )
                  setFormData((prev) => ({
                    ...prev,
                    budgetPerDay,
                    budgetMinPerDay: prev.useCustomBudgetRange ? prev.budgetMinPerDay : suggested.min,
                    budgetMaxPerDay: prev.useCustomBudgetRange ? prev.budgetMaxPerDay : suggested.max,
                    budgetCurrency: prev.budgetCurrency || 'BRL',
                  }))
                }}
                useCustomBudgetRange={formData.useCustomBudgetRange}
                onCustomBudgetRangeToggle={(enabled) =>
                  setFormData((prev) => {
                    if (!enabled) {
                      const suggested = calculateBudgetByGroup(
                        prev.budgetPerDay,
                        prev.groupType,
                        prev.numPeople
                      )

                      return {
                        ...prev,
                        useCustomBudgetRange: false,
                        budgetMinPerDay: suggested.min,
                        budgetMaxPerDay: suggested.max,
                      }
                    }

                    return {
                      ...prev,
                      useCustomBudgetRange: true,
                    }
                  })
                }
                onBudgetRangeChange={({ min, max }) =>
                  setFormData((prev) => ({
                    ...prev,
                    budgetMinPerDay: min,
                    budgetMaxPerDay: max,
                    budgetCurrency: prev.budgetCurrency || 'BRL',
                  }))
                }
              />
            )}

            {/* Step 4: Dates and Season */}
            {step === 4 && (
              <DurationAndBudgetSelector
                planningMode={formData.planningMode || 'dates'}
                startDate={formData.startDate}
                endDate={formData.endDate}
                season={formData.season}
                onPlanningModeChange={(planningMode) =>
                  setFormData((prev) => ({ ...prev, planningMode }))
                }
                onStartDateChange={(startDate) =>
                  setFormData((prev) => ({ ...prev, startDate }))
                }
                onEndDateChange={(endDate) =>
                  setFormData((prev) => ({ ...prev, endDate }))
                }
                onSeasonChange={(season) =>
                  setFormData((prev) => ({ ...prev, season }))
                }
              />
            )}

            {/* Step 5: Destination */}
            {step === 5 && (
              <DestinationSelector
                userLocation={userLocation}
                tripTypes={formData.tripTypes}
                interests={formData.interests}
                groupType={formData.groupType}
                numPeople={formData.numPeople}
                numChildren={formData.numChildren}
                budget={formData.budgetPerDay}
                startDate={formData.startDate}
                endDate={formData.endDate}
                season={formData.season}
                tripScope={formData.tripScope}
                selectedMonth={recommendationMonth}
                selectedDestination={formData.destination}
                onDestinationChange={(destination: string) =>
                  setFormData((prev) => ({ ...prev, destination }))
                }
                onNext={() => handleNext()}
              />
            )}

            {/* Step 6: Preview */}
            {step === 6 && tripForPreview && (
              <TripPreview
                trip={tripForPreview}
                onEdit={(stepNum) => {
                  setStep(stepNum as StepType)
                }}
              />
            )}

            {/* Step 7: Success */}
            {step === 7 && (
              <TripSuccess
                tripId={createdTripId}
                tripName={formData.destination}
                destination={formData.destination}
                onViewTrip={() => navigate(`/trip/${createdTripId}`)}
                onCreateNew={() => {
                  setStep(1)
                  setCreatedTripId('')
                  setFormData({
                    tripScope: '',
                    tripTypes: [],
                    budgetPerDay: 'medio',
                    useCustomBudgetRange: false,
                    budgetMinPerDay: BUDGET_BASE_RANGES.medio.min,
                    budgetMaxPerDay: BUDGET_BASE_RANGES.medio.max,
                    budgetCurrency: 'BRL',
                    groupType: 'casal',
                    travelMonth: '6',
                    planningMode: 'dates',
                    startDate: '',
                    endDate: '',
                    destination: '',
                    interests: [],
                  })
                }}
              />
            )}
          </div>

          {/* Navigation Buttons */}
          {step < 7 && (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handlePrevious}
                disabled={step === 1}
                className="flex-1"
              >
                {t('common.previous') || 'Previous'}
              </Button>

              {step < 6 ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  className="flex-1"
                >
                  {t('common.next') || 'Next'}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading
                    ? t('common.loading') || 'Loading...'
                    : t('createTrip.confirm') || 'Confirm'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
