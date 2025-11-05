import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import useI18n from '../hooks/useI18n'
import { useTripsStore } from '../store/tripsStore'
import { useToast } from '../components/Toast'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Card } from '../components/Card'
import { LoadingOverlay } from '../components/LoadingOverlay'
import { MainLayout } from '../components/Layout'
import { CityAutocomplete } from '../components/CityAutocomplete'
import { generateItinerary } from '../services/itineraryGenerator'
import { getAllCountries, getUniqueCitiesByCountry } from '../utils/citiesDatabase'
import { Budget } from '../types'
import { ArrowLeft, Sparkles, MapPin, Calendar, Users, Heart } from 'lucide-react'
import i18n from 'i18next'

/**
 * CreateTripScreen - Criação de nova viagem com IA
 * 
 * Fluxo:
 * 1. Formulário multi-step (destination, dates, budget, interests)
 * 2. Validação de dados com feedback via Toast
 * 3. Chamar Gemini AI para gerar itinerário
 * 4. Salvar no Firestore
 * 5. Toast sucesso e redirect para /home
 */
const INTERESTS = [
  '🏖️ Praia',
  '🏔️ Montanha',
  '🍴 Culinária',
  '🎨 Arte e Cultura',
  '🏛️ História',
  '🌳 Natureza',
  '🎭 Entretenimento',
  '🛍️ Shopping',
  '⛩️ Religião',
  '🏃 Esportes',
  '📸 Fotografia',
  '🌃 Vida Noturna',
]

interface FormData {
  destination: string
  country: string
  startDate: string
  endDate: string
  budget: Budget
  interests: string[]
  description: string
  groupType: 'solo' | 'casal' | 'amigos' | 'família' | 'group'
}

export default function CreateTripScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useI18n()
  const { addTrip } = useTripsStore()
  const { showError, showSuccess } = useToast()
  
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [countries] = useState<string[]>(getAllCountries())
  const [citiesForCountry, setCitiesForCountry] = useState<string[]>([])
  
  const [formData, setFormData] = useState<FormData>({
    destination: '',
    country: '',
    startDate: '',
    endDate: '',
    budget: 'médio',
    interests: [],
    description: '',
    groupType: 'casal',
  })

  // Função para obter data de hoje em formato YYYY-MM-DD
  const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleGoBack = () => {
    if (step === 1) {
      navigate('/home');
    } else {
      setStep((step - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setCitiesForCountry(getUniqueCitiesByCountry(country));
    setFormData((prev) => ({
      ...prev,
      country: country,
      destination: '', // Limpar destino anterior
    }));
  };

  const handleCitySelect = (city: string) => {
    setFormData((prev) => ({
      ...prev,
      destination: city,
    }))
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!formData.destination.trim()) {
        showError(t('createTrip.invalidDestination'))
        return false
      }
      if (!formData.country.trim()) {
        showError(t('createTrip.invalidCountry'))
        return false
      }
      return true
    }

    if (step === 2) {
      if (!formData.startDate) {
        showError(t('createTrip.invalidStartDate'))
        return false
      }
      if (!formData.endDate) {
        showError(t('createTrip.invalidEndDate'))
        return false
      }
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        showError(t('createTrip.invalidDateRange'))
        return false
      }
      if (formData.interests.length === 0) {
        showError(t('createTrip.invalidInterests'))
        return false
      }
      return true
    }

    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      if (step < 4) {
        setStep((step + 1) as 1 | 2 | 3 | 4);
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateStep() || !user?.uid) {
      console.error('Validação falhou ou user não existe:', { user: user?.uid, validated: validateStep() });
      return;
    }

    try {
      setIsLoading(true);
      console.log('📝 Iniciando criação de viagem...', formData);

      // Calcular número de dias
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      console.log('📅 Dias calculados:', days, { startDate, endDate });

      // Gerar itinerário com IA
      console.log('🤖 Gerando itinerário com Gemini...');
      const currentLanguage = (i18n.language || 'en-US') as 'pt-BR' | 'en-US' | 'es-ES';
      const itinerary = await generateItinerary(
        formData.destination,
        days,
        formData.interests,
        formData.budget,
        formData.groupType,
        currentLanguage
      );

      console.log('✅ Itinerário gerado:', itinerary?.length || 0, 'itens');

      // Salvar viagem no store/Firestore
      console.log('💾 Salvando viagem no Firestore...');
      const tripData = {
        destination: formData.destination,
        country: formData.country,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget,
        groupType: formData.groupType,
        interests: formData.interests,
        description: formData.description,
        itinerary: itinerary ? { itinerary } : null,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      };
      console.log('🔍 Trip data before saving:', tripData);
      console.log('🔍 Trip itinerary:', tripData.itinerary?.itinerary?.[0]);
      await addTrip(tripData)

      // Toast sucesso e redirecionar para home
      setIsLoading(false)
      showSuccess(t('createTrip.tripCreatedSuccess'))
      console.log('🏠 Redirecionando para home...')
      navigate('/home')
    } catch (err) {
      console.error('❌ Erro ao criar viagem:', err);
      showError(
        err instanceof Error
          ? err.message
          : t('createTrip.errorCreating')
      );
      setIsLoading(false);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3 | 4);
    }
  };

  return (
    <MainLayout>
      <LoadingOverlay 
        isVisible={isLoading} 
        message={t('createTrip.generatingItinerary') || 'Gerando itinerário...'} 
      />
      <form className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 pb-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleGoBack}
              type="button"
              className="flex items-center gap-2 text-primary hover:text-primary-dark dark:hover:text-blue-300 mb-4 font-medium transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded"
              aria-label={t('createTrip.backButton')}
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              {t('createTrip.backButton')}
            </button>
            
            <h1 className="text-h1 font-bold text-slate-900 dark:text-white mb-2">
              {t('createTrip.title')}
            </h1>
            
            <p className="text-body text-slate-600 dark:text-slate-300">
              {t('createTrip.subtitle')}
            </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8 flex gap-2" role="progressbar" aria-label={t('createTrip.stepLabel', { step })} aria-valuenow={step} aria-valuemin={1} aria-valuemax={4}>
          {[1, 2, 3, 4].map((s) => (
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

        {/* Step 1: Select Country */}
        {step === 1 && (
          <Card elevation="lg" className="mb-6">
            <Card.Header>
              <h2 className="text-h3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {t('createTrip.selectCountryLabel', 'Selecione o País')}
              </h2>
            </Card.Header>

            <Card.Body className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  {t('createTrip.countryLabel')}
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleCountrySelect(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- {t('createTrip.selectCountry', 'Selecione um país')} --</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              {formData.country && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    ✓ {t('createTrip.countrySelected', 'País selecionado')}: <strong>{formData.country}</strong>
                  </p>
                </div>
              )}
            </Card.Body>

            <Card.Footer>
              <Button
                onClick={() => {
                  if (!formData.country) {
                    showError(t('createTrip.selectCountryError', 'Por favor, selecione um país'));
                    return;
                  }
                  setStep(2);
                }}
                className="w-full"
              >
                {t('createTrip.nextButton')}
              </Button>
            </Card.Footer>
          </Card>
        )}

        {/* Step 2: Select Destination */}
        {step === 2 && (
          <Card elevation="lg" className="mb-6">
            <Card.Header>
              <h2 className="text-h3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {t('createTrip.step1')}
              </h2>
            </Card.Header>

            <Card.Body className="space-y-4">
              <div className="pb-2">
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  {t('createTrip.selectCityLabel', 'Selecione a Cidade')}
                </label>
                <select
                  value={formData.destination}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      destination: e.target.value,
                    }));
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- {t('createTrip.selectCity', 'Selecione uma cidade')} --</option>
                  {citiesForCountry.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-400">
                <p>{t('createTrip.selectedCountry', 'País')}: <strong>{formData.country}</strong></p>
                {formData.destination && (
                  <p className="mt-2 text-green-600 dark:text-green-400">✓ {t('createTrip.selectedDestination', 'Destino')}: <strong>{formData.destination}</strong></p>
                )}
              </div>
            </Card.Body>

            <Card.Footer className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                {t('createTrip.backButton')}
              </Button>
              <Button
                onClick={() => {
                  if (!formData.destination) {
                    showError(t('createTrip.selectCityError', 'Por favor, selecione uma cidade'));
                    return;
                  }
                  setStep(3);
                }}
                className="flex-1"
              >
                {t('createTrip.nextButton')}
              </Button>
            </Card.Footer>
          </Card>
        )}

        {/* Step 3: Dates & Interests */}
        {step === 3 && (
          <>
            <Card elevation="lg" className="mb-6">
              <Card.Header>
                <h2 className="text-h3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {t('createTrip.step2')}
                </h2>
              </Card.Header>

              <Card.Body className="space-y-4">
                <Input
                  label={t('createTrip.startDateLabel')}
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  min={getTodayDateString()}
                />

                <Input
                  label={t('createTrip.endDateLabel')}
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate || getTodayDateString()}
                />
              </Card.Body>
            </Card>

            <Card elevation="lg" className="mb-6">
              <Card.Header>
                <h2 className="text-h3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  {t('createTrip.interestsLabel')}
                </h2>
              </Card.Header>

              <Card.Body>
                <div className="grid grid-cols-2 gap-2" role="group" aria-label={t('createTrip.selectInterests')}>
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`p-3 rounded-lg border-2 transition text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                        formData.interests.includes(interest)
                          ? 'border-primary dark:border-blue-400 bg-primary/10 dark:bg-blue-900/30 text-primary dark:text-blue-300 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300'
                      }`}
                      aria-pressed={formData.interests.includes(interest)}
                      aria-label={`${interest} - ${formData.interests.includes(interest) ? 'selecionado' : 'não selecionado'}`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </Card.Body>

              <Card.Footer>
                <div className="flex gap-3">
                  <Button
                    onClick={handlePrevStep}
                    variant="outline"
                    className="flex-1"
                  >
                    {t('createTrip.previousButton')}
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1"
                  >
                    {t('createTrip.nextButton')}
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </>
        )}

        {/* Step 4: Budget & Review */}
        {step === 4 && (
          <Card elevation="lg" className="mb-6">
            <Card.Header>
              <h2 className="text-h3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                {t('createTrip.step3')}
              </h2>
            </Card.Header>

            <Card.Body className="space-y-4">
              {/* Budget */}
              <div>
                <label className="block text-small font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('createTrip.budgetLabel')}
                </label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      budget: e.target.value as Budget,
                    }))
                  }
                  className="input-base"
                >
                  <option value="econômico">{t('createTrip.budgetEconomic')}</option>
                  <option value="médio">{t('createTrip.budgetMedium')}</option>
                  <option value="luxo">{t('createTrip.budgetLuxury')}</option>
                </select>
              </div>

              {/* Group Type */}
              <div>
                <label className="block text-small font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('createTrip.groupTypeLabel')}
                </label>
                <select
                  name="groupType"
                  value={formData.groupType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      groupType: e.target.value as 'solo' | 'casal' | 'amigos' | 'família' | 'group',
                    }))
                  }
                  className="input-base"
                >
                  <option value="solo">{t('createTrip.groupTypeSolo')}</option>
                  <option value="casal">{t('createTrip.groupTypeCouple')}</option>
                  <option value="amigos">{t('createTrip.groupTypeFriends')}</option>
                  <option value="família">{t('createTrip.groupTypeFamily')}</option>
                  <option value="group">{t('createTrip.groupTypeGroup')}</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-small font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('createTrip.additionalInfoLabel')}
                </label>
                <textarea
                  name="description"
                  placeholder={t('createTrip.additionalInfoPlaceholder')}
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-base resize-none"
                />
              </div>

              {/* Summary */}
              <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4 border border-primary/30 dark:border-primary/40">
                <p className="text-small text-slate-700 dark:text-slate-300 mb-3 font-medium">
                  {t('createTrip.summaryTitle')}
                </p>
                <div className="space-y-1 text-small text-slate-600 dark:text-slate-300">
                  <p>{t('createTrip.summaryDestination', { destination: formData.destination, country: formData.country })}</p>
                  <p>{t('createTrip.summaryDates', { startDate: new Date(formData.startDate).toLocaleDateString('pt-BR'), endDate: new Date(formData.endDate).toLocaleDateString('pt-BR') })}</p>
                  <p>{t('createTrip.summaryBudget', { budget: formData.budget === 'econômico' ? t('createTrip.budgetEconomicLabel') : formData.budget === 'médio' ? t('createTrip.budgetMediumLabel') : t('createTrip.budgetLuxuryLabel') })}</p>
                  <p>
                    {t('createTrip.summaryInterests', { count: formData.interests.length })}
                  </p>
                </div>
              </div>
            </Card.Body>

            <Card.Footer>
              <div className="flex gap-3">
                <Button
                  onClick={handlePrevStep}
                  variant="outline"
                  className="flex-1"
                >
                  {t('createTrip.previousButton')}
                </Button>
                <Button
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="flex-1 gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isLoading ? t('createTrip.createButtonLoading') : t('createTrip.createButton')}
                </Button>
              </div>
            </Card.Footer>
          </Card>
        )}
        </div>
      </form>
    </MainLayout>
  )
}
