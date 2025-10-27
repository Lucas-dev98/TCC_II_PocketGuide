import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTripsStore } from '../store/tripsStore'
import { useToast } from '../components/Toast'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Card } from '../components/Card'
import { MainLayout } from '../components/Layout'
import { generateItinerary } from '../services/itineraryGenerator'
import { Budget } from '../types'
import { ArrowLeft, Sparkles, MapPin, Calendar, Users, Heart } from 'lucide-react'

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
}

export default function CreateTripScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addTrip } = useTripsStore()
  const { showError } = useToast()
  
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    destination: '',
    country: '',
    startDate: '',
    endDate: '',
    budget: 'médio',
    interests: [],
    description: '',
  })

  const handleGoBack = () => {
    if (step === 1) {
      navigate('/home');
    } else {
      setStep((step - 1) as 1 | 2 | 3);
    }
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
        const msg = 'Por favor, digite o destino'
        showError(msg)
        return false
      }
      if (!formData.country.trim()) {
        const msg = 'Por favor, digite o país'
        showError(msg)
        return false
      }
      return true
    }

    if (step === 2) {
      if (!formData.startDate) {
        const msg = 'Por favor, selecione a data de início'
        showError(msg)
        return false
      }
      if (!formData.endDate) {
        const msg = 'Por favor, selecione a data de fim'
        showError(msg)
        return false
      }
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        const msg = 'A data de fim deve ser após a data de início'
        showError(msg)
        return false
      }
      if (formData.interests.length === 0) {
        const msg = 'Por favor, selecione pelo menos um interesse'
        showError(msg)
        return false
      }
      return true
    }

    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      if (step < 3) {
        setStep((step + 1) as 1 | 2 | 3);
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
      const itinerary = await generateItinerary(
        formData.destination,
        days,
        formData.interests,
        formData.budget,
        'couple' // groupType padrão
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
      showError('✅ Viagem criada com sucesso!')
      console.log('🏠 Redirecionando para home...')
      navigate('/home')
    } catch (err) {
      console.error('❌ Erro ao criar viagem:', err);
      showError(
        err instanceof Error
          ? err.message
          : 'Erro ao criar viagem. Tente novamente.'
      );
      setIsLoading(false);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3);
    }
  };

  return (
    <MainLayout>
      <form className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 pb-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleGoBack}
              type="button"
              className="flex items-center gap-2 text-primary hover:text-primary-dark dark:hover:text-blue-300 mb-4 font-medium transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded"
              aria-label="Voltar para etapa anterior ou página inicial"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Voltar
            </button>
            
            <h1 className="text-h1 font-bold text-slate-900 dark:text-white mb-2">
              Criar Nova Viagem ✈️
            </h1>
            
            <p className="text-body text-slate-600 dark:text-slate-400">
            Deixe nossa IA criar um roteiro perfeito para você
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8 flex gap-2" role="progressbar" aria-label={`Etapa ${step} de 3`} aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}>
          {[1, 2, 3].map((s) => (
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

        {/* Step 1: Location */}
        {step === 1 && (
          <Card elevation="lg" className="mb-6">
            <Card.Header>
              <h2 className="text-h3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Onde você quer ir?
              </h2>
            </Card.Header>

            <Card.Body className="space-y-4">
              <Input
                label="Destino *"
                name="destination"
                placeholder="Ex: Barcelona, Roma, Tokyo..."
                value={formData.destination}
                onChange={handleInputChange}
                autoFocus
              />

              <Input
                label="País *"
                name="country"
                placeholder="Ex: Espanha, Itália, Japão..."
                value={formData.country}
                onChange={handleInputChange}
              />
            </Card.Body>

            <Card.Footer>
              <Button
                onClick={handleNext}
                className="w-full"
              >
                Próximo →
              </Button>
            </Card.Footer>
          </Card>
        )}

        {/* Step 2: Dates & Interests */}
        {step === 2 && (
          <>
            <Card elevation="lg" className="mb-6">
              <Card.Header>
                <h2 className="text-h3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Quando você quer viajar?
                </h2>
              </Card.Header>

              <Card.Body className="space-y-4">
                <Input
                  label="Data de Início *"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />

                <Input
                  label="Data de Fim *"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </Card.Body>
            </Card>

            <Card elevation="lg" className="mb-6">
              <Card.Header>
                <h2 className="text-h3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Seus interesses *
                </h2>
              </Card.Header>

              <Card.Body>
                <div className="grid grid-cols-2 gap-2" role="group" aria-label="Selecione seus interesses de viagem">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`p-3 rounded-lg border-2 transition text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                        formData.interests.includes(interest)
                          ? 'border-primary dark:border-blue-400 bg-primary/10 dark:bg-blue-900/30 text-primary dark:text-blue-300 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
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
                    ← Anterior
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1"
                  >
                    Próximo →
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </>
        )}

        {/* Step 3: Budget & Review */}
        {step === 3 && (
          <Card elevation="lg" className="mb-6">
            <Card.Header>
              <h2 className="text-h3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Ajustes Finais
              </h2>
            </Card.Header>

            <Card.Body className="space-y-4">
              {/* Budget */}
              <div>
                <label className="block text-small font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Orçamento
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
                  <option value="econômico">💰 Econômico (até $50/dia)</option>
                  <option value="médio">💳 Médio ($50-150/dia)</option>
                  <option value="luxo">💎 Luxo ($150+/dia)</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-small font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Informações Adicionais (opcional)
                </label>
                <textarea
                  name="description"
                  placeholder="Ex: Viajando com crianças, viagem de lua de mel, etc."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-base resize-none"
                />
              </div>

              {/* Summary */}
              <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4 border border-primary/30 dark:border-primary/40">
                <p className="text-small text-slate-700 dark:text-slate-300 mb-3 font-medium">
                  📋 Resumo da sua viagem:
                </p>
                <div className="space-y-1 text-small text-slate-600 dark:text-slate-400">
                  <p>🗺️ <strong>{formData.destination}, {formData.country}</strong></p>
                  <p>📅 {new Date(formData.startDate).toLocaleDateString('pt-BR')} a {new Date(formData.endDate).toLocaleDateString('pt-BR')}</p>
                  <p>💰 Orçamento: {formData.budget === 'econômico' ? 'Econômico' : formData.budget === 'médio' ? 'Médio' : 'Luxo'}</p>
                  <p>
                    ❤️ {formData.interests.length} interesse(s) selecionado(s)
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
                  ← Anterior
                </Button>
                <Button
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="flex-1 gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isLoading ? 'Gerando com IA...' : 'Criar Viagem'}
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
