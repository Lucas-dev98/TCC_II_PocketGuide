import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { CreateTripCTA } from '../../components/CreateTripCTA'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock useI18n hook
vi.mock('../../hooks/useI18n', () => ({
  default: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'trips.readyToExplore': 'Ready to Explore?',
        'trips.createYourNextAdventure': 'Create your next itinerary with AI',
        'trips.createNewTrip': 'Create New Trip',
      }
      return translations[key] || key
    },
  }),
}))

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('CreateTripCTA Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('should render the component', () => {
    render(
      <Wrapper>
        <CreateTripCTA />
      </Wrapper>
    )
    
    expect(screen.getAllByText('Ready to Explore?').length).toBeGreaterThan(0)
  })

  it('should display correct heading text', () => {
    render(
      <Wrapper>
        <CreateTripCTA />
      </Wrapper>
    )
    
    expect(screen.getAllByText('Ready to Explore?').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Create your next itinerary with AI').length).toBeGreaterThan(0)
  })

  it('should render CTA button', () => {
    render(
      <Wrapper>
        <CreateTripCTA />
      </Wrapper>
    )
    
    const buttons = screen.getAllByRole('button', { name: /Create New Trip/i })
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should navigate to create-trip when button is clicked', () => {
    render(
      <Wrapper>
        <CreateTripCTA />
      </Wrapper>
    )
    
    const buttons = screen.getAllByRole('button', { name: /Create New Trip/i })
    fireEvent.click(buttons[0])
    
    expect(mockNavigate).toHaveBeenCalledWith('/create-trip')
  })

  it('should display Globe icon', () => {
    const { container } = render(
      <Wrapper>
        <CreateTripCTA />
      </Wrapper>
    )
    
    // Lucide react icons are rendered as svg
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('should have responsive classes', () => {
    const { container } = render(
      <Wrapper>
        <CreateTripCTA />
      </Wrapper>
    )
    
    // Mobile section should have lg:hidden
    const mobileSection = container.querySelector('.lg\\:hidden')
    expect(mobileSection).toBeInTheDocument()
    
    // Desktop section should have hidden lg:block
    const desktopSection = container.querySelector('.hidden.lg\\:block')
    expect(desktopSection).toBeInTheDocument()
  })

  it('should display features on desktop view', () => {
    render(
      <Wrapper>
        <CreateTripCTA />
      </Wrapper>
    )
    
    // These feature texts should be in the document
    expect(screen.getByText(/AI Powered/i)).toBeInTheDocument()
    expect(screen.getByText(/Personalized/i)).toBeInTheDocument()
    expect(screen.getByText(/Easy to Use/i)).toBeInTheDocument()
  })

  it('should have animation classes', () => {
    const { container } = render(
      <Wrapper>
        <CreateTripCTA />
      </Wrapper>
    )
    
    // Check for animation classes like animate-bounce or animate-pulse
    const animatedElements = container.querySelectorAll('[class*="animate-"]')
    expect(animatedElements.length).toBeGreaterThan(0)
  })

  it('should have gradient background', () => {
    const { container } = render(
      <Wrapper>
        <CreateTripCTA />
      </Wrapper>
    )
    
    // Look for gradient classes
    const gradientElements = container.querySelectorAll('[class*="gradient"]')
    expect(gradientElements.length).toBeGreaterThan(0)
  })
})
