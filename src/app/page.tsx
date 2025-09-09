import { Metadata } from 'next'
import { LandingHero } from '@/components/landing/LandingHero'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { TemplatesShowcase } from '@/components/landing/TemplatesShowcase'
import { PricingSection } from '@/components/landing/PricingSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { CTASection } from '@/components/landing/CTASection'
import { Footer } from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'AI-Powered Instagram Content Creator for Fashion Boutiques',
  description: 'Create stunning Instagram posts in minutes with AI-powered design tools, fashion-focused templates, and direct publishing. Perfect for boutique owners and fashion retailers.',
  openGraph: {
    title: 'Taylor Collection - Transform Your Boutique\'s Instagram Presence',
    description: 'Create stunning Instagram posts in minutes with AI-powered design tools, fashion-focused templates, and direct publishing.',
  },
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <LandingHero />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Templates Showcase */}
      <TemplatesShowcase />
      
      {/* Testimonials */}
      <TestimonialsSection />
      
      {/* Pricing Section */}
      <PricingSection />
      
      {/* Final CTA */}
      <CTASection />
      
      {/* Footer */}
      <Footer />
    </main>
  )
}