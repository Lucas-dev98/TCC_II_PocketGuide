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
import { SeasonalSelector } from '../components/SeasonalSelector'
import { DestinationSelector } from '../components/DestinationSelector'
import { InterestsSelector } from '../components/InterestsSelector'
import { TripPreview } from '../components/TripPreview'
import { TripSuccess } from '../components/TripSuccess'
import { TripType, TripDuration, BudgetPerDay, GroupType, Trip } from '../types'
import { ArrowLeft } from 'lucide-react'
import i18n from 'i18next'

/**
 * CreateTripScreen - 6-Step Trip Creation Flow
 * 
 * Steps:
 * 1. TravelTypeSelector + InterestsSelector - Select trip type and interests together
 * 2. DurationAndBudgetSelector - Select duration, budget, and travel dates
 * 3. GroupCompositionSelector - Select group type and composition
 * 4. SeasonalSelector - Select travel month and season
 * 5. DestinationSelector - Select destination with AI recommendations
 * 6. TripPreview - Review and confirm all details
 * 7. TripSuccess - Confirmation and next steps
 */

interface TripFormData {
  tripTypes: TripType[];
  duration: TripDuration;
  budgetPerDay: BudgetPerDay;
  groupType: GroupType;
  numPeople?: number;
  numChildren?: number;
  travelMonth: string;
  startDate: string;
  endDate: string;
  destination: string;
  interests: string[];
}

type StepType = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export default function CreateTripScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useI18n()
  const { addTrip } = useTripsStore()
  const { showError, showSuccess } = useToast()

  const [step, setStep] = useState<StepType>(1)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState<TripFormData>({
    tripTypes: [],
    duration: 'uma-semana',
    budgetPerDay: 'medio',
    groupType: 'casal',
    travelMonth: '6',
    startDate: '',
    endDate: '',
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
        if (!formData.duration) {
          showError(t('createTrip.selectDuration') || 'Please select a duration')
          return false
        }
        if (!formData.budgetPerDay) {
          showError(t('createTrip.selectBudget') || 'Please select a budget')
          return false
        }
        return true

      case 3:
        if (!formData.groupType) {
          showError(t('createTrip.selectGroupType') || 'Please select a group type')
          return false
        }
        return true

      case 4:
        if (!formData.travelMonth) {
          showError(t('createTrip.selectMonth') || 'Please select a month')
          return false
        }
        return true

      case 5:
        if (!formData.startDate) {
          showError(t('createTrip.selectStartDate') || 'Please select a start date')
          return false
        }
        if (!formData.endDate) {
          showError(t('createTrip.selectEndDate') || 'Please select an end date')
          return false
        }
        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
          showError(t('createTrip.invalidDateRange') || 'End date must be after start date')
          return false
        }
        return true

      case 6:
        if (!formData.destination.trim()) {
          showError(t('createTrip.selectDestination') || 'Please select a destination')
          return false
        }
        return true

      case 7:
        return true

      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep()) {
      if (step < 8) {
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

      // Calculate duration
      const durationDays = formData.duration === 'uma-semana' ? 7 
                          : formData.duration === 'duas-semanas' ? 14 
                          : formData.duration === 'mes-plus' ? 30 
                          : formData.duration === 'fim-de-semana' ? 3
                          : 7

      // Generate AI itinerary
      const currentLanguage = (i18n.language || 'pt-BR') as 'pt-BR' | 'en-US' | 'es-ES'
      await generateItinerary(
        formData.destination,
        durationDays,
        formData.interests,
        formData.budgetPerDay,
        formData.groupType,
        currentLanguage
      )

      // Create trip data
      const today = new Date().toISOString().split('T')[0]
      const tripData: Trip = {
        id: crypto.randomUUID(),
        userId: user.uid,
        destination: formData.destination,
        country: formData.destination, // Could be enhanced to extract country
        startDate: today,
        endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tripType: formData.tripTypes[0] || 'cultura',
        duration: formData.duration,
        budgetPerDay: formData.budgetPerDay,
        groupType: formData.groupType,
        travelMonth: formData.travelMonth,
        interests: formData.interests,
        createdAt: new Date().toISOString(),
      }

      // Save trip
      await addTrip(tripData)

      showSuccess(t('createTrip.tripCreatedSuccess') || 'Trip created successfully!')
      setStep(7)
    } catch (err) {
      console.error('Error creating trip:', err)
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
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tripType: formData.tripTypes[0] || 'cultura',
    duration: formData.duration,
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

            {/* Step 2: Duration and Budget */}
            {step === 2 && (
              <DurationAndBudgetSelector
                duration={formData.duration}
                budgetPerDay={formData.budgetPerDay}
                startDate={formData.startDate}
                endDate={formData.endDate}
                onDurationChange={(duration) =>
                  setFormData((prev) => ({ ...prev, duration }))
                }
                onBudgetChange={(budgetPerDay) =>
                  setFormData((prev) => ({ ...prev, budgetPerDay }))
                }
                onStartDateChange={(startDate) =>
                  setFormData((prev) => ({ ...prev, startDate }))
                }
                onEndDateChange={(endDate) =>
                  setFormData((prev) => ({ ...prev, endDate }))
                }
              />
            )}

            {/* Step 3: Group Composition */}
            {step === 3 && (
              <GroupCompositionSelector
                selectedGroup={formData.groupType}
                numPeople={formData.numPeople}
                numChildren={formData.numChildren}
                onGroupChange={(groupType) =>
                  setFormData((prev) => ({ ...prev, groupType }))
                }
                onNumPeopleChange={(numPeople) =>
                  setFormData((prev) => ({ ...prev, numPeople }))
                }
                onNumChildrenChange={(numChildren) =>
                  setFormData((prev) => ({ ...prev, numChildren }))
                }
              />
            )}

            {/* Step 4: Seasonal Selection */}
            {step === 4 && (
              <SeasonalSelector
                destination={formData.destination || 'Generic'}
                selectedMonth={parseInt(formData.travelMonth)}
                selectedYear={new Date().getFullYear()}
                onMonthChange={(month) =>
                  setFormData((prev) => ({ ...prev, travelMonth: month.toString() }))
                }
                onYearChange={() => {
                  // Year selection not needed for this flow
                }}
              />
            )}

            {/* Step 5: Destination */}
            {step === 5 && (
              <DestinationSelector
                tripTypes={formData.tripTypes}
                duration={formData.duration}
                budget={formData.budgetPerDay}
                selectedMonth={parseInt(formData.travelMonth)}
                onDestinationChange={(destination: string) =>
                  setFormData((prev) => ({ ...prev, destination }))
                }
              />
            )}

            {/* Step 6: Preview */}
            {step === 6 && tripForPreview && (
              <TripPreview
                trip={tripForPreview}
                onConfirm={handleSubmit}
                onEdit={(stepNum) => {
                  setStep(stepNum as StepType)
                }}
              />
            )}

            {/* Step 7: Success */}
            {step === 7 && (
              <TripSuccess
                tripId="new-trip"
                tripName={formData.destination}
                destination={formData.destination}
                onViewTrip={() => navigate('/home')}
                onCreateNew={() => {
                  setStep(1)
                  setFormData({
                    tripTypes: [],
                    duration: 'uma-semana',
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
