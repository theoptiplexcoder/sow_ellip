import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@sow-platform/ui';
import { Reveal } from './reveal';

const FAQS = [
  {
    q: 'How long does it take to get started?',
    a: 'Most teams are drafting their first SOW within an hour of signing up. Import your existing templates or start from one of our pre-built libraries.',
  },
  {
    q: 'Can clients use the platform without an account?',
    a: 'Yes. Clients receive a secure portal link to review, comment, and sign — no login or account creation required on their end.',
  },
  {
    q: 'Does it integrate with our existing tools?',
    a: 'SOWork connects with Slack, Microsoft Teams, and email for notifications, and exports to DOCX and PDF for systems that need it.',
  },
  {
    q: 'What happens to our data if we cancel?',
    a: 'You retain full export access to every SOW, version, and signed document for 90 days after cancellation, with no lock-in.',
  },
  {
    q: 'Is e-signature legally binding?',
    a: 'Yes. Our e-signature flow is compliant with ESIGN and UETA in the US, and eIDAS in the EU.',
  },
  {
    q: 'Can we customize approval workflows per client or project type?',
    a: 'Absolutely. Approval chains can be configured by deal size, department, risk level, or any custom field you define.',
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal className="text-center">
          <span className="text-xs font-medium tracking-wide text-indigo-500 uppercase">
            FAQ
          </span>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
        </Reveal>

        <Reveal
          delay={0.1}
          className="mt-12 rounded-2xl border border-foreground/10 bg-card/60 px-6"
        >
          <Accordion>
            {FAQS.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q}>
                <AccordionTrigger className="py-5 text-[15px]">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-foreground/60">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
