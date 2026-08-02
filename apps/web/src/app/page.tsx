import './landing.css';
import { LenisProvider } from '@/components/landing/lenis-provider';
import { ScrollProgress } from '@/components/landing/scroll-progress';
import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { LogoMarquee } from '@/components/landing/logo-marquee';
import { ProblemSection } from '@/components/landing/problem-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { WorkflowSection } from '@/components/landing/workflow-section';
import { ShowcaseSection } from '@/components/landing/showcase-section';
import { BenefitsSection } from '@/components/landing/benefits-section';
import { MetricsSection } from '@/components/landing/metrics-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { SecuritySection } from '@/components/landing/security-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { FAQSection } from '@/components/landing/faq-section';
import { FinalCtaSection } from '@/components/landing/final-cta-section';
import { Footer } from '@/components/landing/footer';

export default function Index() {
  return (
    <LenisProvider>
      <div className="landing relative min-h-screen">
        <ScrollProgress />
        <Navbar />
        <main>
          <Hero />
          <LogoMarquee />
          <ProblemSection />
          <FeaturesSection />
          <WorkflowSection />
          <ShowcaseSection />
          <BenefitsSection />
          <MetricsSection />
          <TestimonialsSection />
          <SecuritySection />
          <PricingSection />
          <FAQSection />
          <FinalCtaSection />
        </main>
        <Footer />
      </div>
    </LenisProvider>
  );
}
