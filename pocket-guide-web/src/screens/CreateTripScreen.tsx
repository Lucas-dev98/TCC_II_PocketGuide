import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import useI18n from '../hooks/useI18n'
import { useTripsStore } from '../store/tripsStore'
import { useToast } from '../components/Toast'
import { Button } from '../components/Button'
import { LoadingOverlay } from '../components/LoadingOverlay'
import { MainLayout } from '../components/Layout'
import { generateItinerary } from '../services/itineraryGenerator'
import { TravelTypeSelector } from '../components/TravelTypeSelector'
import { DurationAndBudgetSelector } from '../components/DurationAndBudgetSelector'
import { GroupCompositionSelector } from '../components/GroupCompositionSelector'
import { DestinationSelector } from '../components/DestinationSelector'
import { InterestsSelector } from '../components/InterestsSelector'
import { TripPreview } from '../components/TripPreview'
import { TripSuccess } from '../components/TripSuccess'
import { TripType, BudgetPerDay, GroupType, Trip } from '../types'
import { ArrowLeft } from 'lucide-react'
import i18n from 'i18next'

/**
 * CreateTripScreen - Simplified Trip Creation Flow
 * 
 * Flow (Simplified Order):
 * Step 1: Travel Type + Interests - Select trip type and interests together
 * Step 2: Group Composition + Budget - Select group type, number of people, and daily budget
 * Step 3: Duration + Dates - Select travel dates
 * Step 4: Destination - Select destination
 * Step 5: Trip Preview - Review all trip details
 * Step 6: Trip Success - Confirmation and next steps
 */

interface TripFormData {
  tripTypes: TripType[];
  budgetPerDay: BudgetPerDay;
  groupType: GroupType;
  numPeople?: number;
  numChildren?: number;
  travelMonth: string;
  startDate: string;
  endDate: string;
  season?: 'primavera' | 'verão' | 'outono' | 'inverno';
  destination: string;
  interests: string[];
}

type StepType = 1 | 2 | 3 | 4 | 5 | 6;

export default function CreateTripScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useI18n()
  const { addTrip, loadTrips } = useTripsStore()
  const { showError, showSuccess } = useToast()

  const [step, setStep] = useState<StepType>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [createdTripId, setCreatedTripId] = useState<string>('')

  const [formData, setFormData] = useState<TripFormData>({
    tripTypes: [],
    budgetPerDay: 'medio',
    groupType: 'casal',
    travelMonth: '6',
    startDate: '',
    endDate: '',
    season: 'primavera',
    destination: '',
    interests: [],
  })

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
        // Step 1: Trip Type + Interests - required
        if (formData.tripTypes.length === 0) {
          showError(t('createTrip.selectTravelType') || 'Please select at least one travel type')
          return false
        }
        if (formData.interests.length === 0) {
          showError(t('createTrip.selectInterests') || 'Please select at least one interest')
          return false
        }
        return true

      case 2:
        // Step 2: Group Composition + Budget Selection - required
        if (!formData.groupType) {
          showError(t('createTrip.selectGroupType') || 'Please select a group type')
          return false
        }
        if (!formData.budgetPerDay) {
          showError(t('createTrip.selectBudget') || 'Please select a budget')
          return false
        }
        return true

      case 3:
        // Step 3: Dates + Month - required
        if (!formData.startDate) {
          showError(t('createTrip.selectStartDate') || 'Please select a start date')
          return false
        }
        if (!formData.endDate) {
          showError(t('createTrip.selectEndDate') || 'Please select an end date')
          return false
        }
        return true

      case 4:
        // Step 4: Destination - required
        if (!formData.destination.trim()) {
          showError(t('createTrip.selectDestination') || 'Please select a destination')
          return false
        }
        return true

      case 5:
        // Step 5: Preview - always allowed
        return true

      case 6:
        // Step 6: Success - always allowed
        return true

      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep()) {
      if (step < 6) {
        setStep((step + 1) as StepType)
      }
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep((step - 1) as StepType)
    }
  }

  const handleSubmit = async () => {
    if (!user?.uid) {
      showError(t('createTrip.userNotFound') || 'User not found')
      return
    }

    try {
      setIsLoading(true)

      console.log('🚀 Starting trip creation process...')
      console.log('📊 Form data:', formData)
      console.log('👤 User ID:', user.uid)

      // Calculate duration from dates
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

      console.log('📅 Duration:', durationDays, 'days')

      // Generate AI itinerary with timeout fallback
      let itinerary = []
      try {
        console.log('⏳ Generating itinerary...')
        const currentLanguage = (i18n.language || 'pt-BR') as 'pt-BR' | 'en-US' | 'es-ES'
        
        // Add timeout to prevent hanging
        const itineraryPromise = generateItinerary(
          formData.destination,
          durationDays,
          formData.interests,
          formData.budgetPerDay,
          formData.groupType,
          currentLanguage
        )

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Itinerary generation timeout')), 30000)
        )

        itinerary = (await Promise.race([itineraryPromise, timeoutPromise])) as any
        console.log('✅ Itinerary generated:', itinerary?.length || 0, 'items')
      } catch (itineraryError) {
        console.warn('⚠️ Itinerary generation failed, continuing with empty itinerary:', itineraryError)
        itinerary = [] // Continue with empty itinerary
      }

      // Create trip data with itinerary
      const tripData: Trip = {
        userId: user.uid,
        destination: formData.destination,
        country: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        tripType: formData.tripTypes[0] || 'cultura',
        budgetPerDay: formData.budgetPerDay,
        groupType: formData.groupType,
        travelMonth: formData.travelMonth,
        interests: formData.interests,
        itinerary: itinerary || [], // Ensure itinerary is always an array
        createdAt: new Date().toISOString(),
      } as Trip

      console.log('📝 Final trip data to save:', {
        userId: tripData.userId,
        destination: tripData.destination,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        hasItinerary: !!(tripData.itinerary && tripData.itinerary.length > 0),
      })

      // Save trip and get ID
      console.log('💾 Calling addTrip...')
      const tripId = await addTrip(tripData)
      console.log('✅ Trip saved with ID:', tripId)
      
      setCreatedTripId(tripId)

      showSuccess(t('createTrip.tripCreatedSuccess') || 'Trip created successfully!')
      
      // IMPORTANTE: Recarregar trips imediatamente após criar
      console.log('🔄 Reloading trips immediately after creation...')
      await loadTrips(user.uid)
      console.log('✅ Trips reloaded')
      
      setStep(6)
    } catch (err) {
      console.error('❌ Error creating trip:', err)
      console.error('Error details:', err instanceof Error ? err.stack : err)
      showError(
        err instanceof Error
          ? err.message
          : t('createTrip.errorCreating') || 'Error creating trip'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const tripForPreview: Trip | null = formData.destination ? {
    id: 'preview',
    userId: user?.uid || '',
    destination: formData.destination,
    country: formData.destination,
    startDate: formData.startDate || new Date().toISOString().split('T')[0],
    endDate: formData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tripType: formData.tripTypes[0] || 'cultura',
    budgetPerDay: formData.budgetPerDay,
    groupType: formData.groupType,
    travelMonth: formData.travelMonth,
    interests: formData.interests,
    createdAt: new Date().toISOString(),
  } : null

  return (
    <MainLayout>
      <LoadingOverlay
        isVisible={isLoading}
        message={t('createTrip.generatingItinerary') || 'Generating itinerary...'}
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
            aria-label={`Step ${step} of 6`}
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={6}
          >
            {[1, 2, 3, 4, 5, 6].map((s) => (
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
            {/* Step 1: Travel Type + Interests */}
            {step === 1 && (
              <div className="space-y-8">
                <TravelTypeSelector
                  selected={formData.tripTypes}
                  onChange={(types) =>
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

            {/* Step 2: Group Composition + Budget Selection */}
            {step === 2 && (
              <GroupCompositionSelector
                selectedGroup={formData.groupType}
                numPeople={formData.numPeople}
                numChildren={formData.numChildren}
                budgetPerDay={formData.budgetPerDay}
                onGroupChange={(groupType) =>
                  setFormData((prev) => ({ ...prev, groupType }))
                }
                onNumPeopleChange={(numPeople) =>
                  setFormData((prev) => ({ ...prev, numPeople }))
                }
                onNumChildrenChange={(numChildren) =>
                  setFormData((prev) => ({ ...prev, numChildren }))
                }
                onBudgetChange={(budgetPerDay) =>
                  setFormData((prev) => ({ ...prev, budgetPerDay }))
                }
              />
            )}

            {/* Step 3: Dates and Season */}
            {step === 3 && (
              <DurationAndBudgetSelector
                startDate={formData.startDate}
                endDate={formData.endDate}
                season={formData.season}
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

            {/* Step 4: Destination */}
            {step === 4 && (
              <DestinationSelector
                tripTypes={formData.tripTypes}
                interests={formData.interests}
                groupType={formData.groupType}
                numPeople={formData.numPeople}
                numChildren={formData.numChildren}
                budget={formData.budgetPerDay}
                startDate={formData.startDate}
                endDate={formData.endDate}
                selectedMonth={parseInt(formData.travelMonth)}
                selectedDestination={formData.destination}
                onDestinationChange={(destination: string) =>
                  setFormData((prev) => ({ ...prev, destination }))
                }
                onNext={() => handleNext()}
              />
            )}

            {/* Step 5: Preview */}
            {step === 5 && tripForPreview && (
              <TripPreview
                trip={tripForPreview}
                onEdit={(stepNum) => {
                  setStep(stepNum as StepType)
                }}
              />
            )}

            {/* Step 6: Success */}
            {step === 6 && (
              <TripSuccess
                tripId={createdTripId}
                tripName={formData.destination}
                destination={formData.destination}
                onViewTrip={() => navigate(`/trip/${createdTripId}`)}
                onCreateNew={() => {
                  setStep(1)
                  setCreatedTripId('')
                  setFormData({
                    tripTypes: [],
                    budgetPerDay: 'medio',
                    groupType: 'casal',
                    travelMonth: '6',
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
          {step < 6 && (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handlePrevious}
                disabled={step === 1}
                className="flex-1"
              >
                {t('common.previous') || 'Previous'}
              </Button>

              {step < 5 ? (
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
