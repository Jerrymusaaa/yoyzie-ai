import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/sections/HeroSection'
import { TickerSection } from '@/components/sections/TickerSection'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { AIAssistantSection } from '@/components/sections/AIAssistantSection'
import { IntegrationsSection } from '@/components/sections/IntegrationsSection'
import { PricingSection } from '@/components/sections/PricingSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { CTASection } from '@/components/sections/CTASection'

export default function Home() {
  return (
    <div className="noise-overlay" style={{ background: 'var(--brand-dark)' }}>
      <Navbar />
      <main>
        <HeroSection />
        <TickerSection />
        <FeaturesSection />
        <AIAssistantSection />
        <IntegrationsSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
