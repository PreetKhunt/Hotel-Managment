'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What time is check-in and check-out?',
    answer:
      'Standard check-in time is 3:00 PM and check-out is 12:00 PM (noon). Early check-in and late check-out are available upon request and subject to availability. Guests enrolled in our Prestige Loyalty programme receive complimentary early check-in when rooms are available.',
  },
  {
    question: 'Is free parking available?',
    answer:
      'We offer complimentary valet parking for all registered hotel guests, available 24 hours a day, 7 days a week. Self-parking is also available in our secure underground garage. Oversized vehicles and motorcoaches must pre-arrange parking with our concierge team.',
  },
  {
    question: 'Do you allow pets?',
    answer:
      'We warmly welcome well-behaved pets up to 25 kg in our designated pet-friendly suites. A refundable security deposit of ₹15,000 applies. Please inform us at the time of booking, as pet-friendly rooms are limited and subject to availability.',
  },
  {
    question: 'What amenities are included with my stay?',
    answer:
      'All rooms include complimentary high-speed Wi-Fi, access to the fitness center, daily housekeeping, in-room premium toiletries, and access to our business center. Suite guests additionally receive daily complimentary breakfast, evening turndown service, and a welcome amenity.',
  },
  {
    question: 'Can I request a late check-out?',
    answer:
      'Late check-out until 2:00 PM is complimentary for Prestige and Elite loyalty members, subject to availability. For all other guests, late check-out may be arranged for a nominal fee. Requests should be made with the front desk no later than the morning of departure.',
  },
  {
    question: 'Is the hotel wheelchair accessible?',
    answer:
      'Hospitality Hub is fully wheelchair accessible. We have dedicated accessible rooms with roll-in showers, grab bars, and lowered amenities. Our entrance, elevators, restaurants, and spa are all step-free. Please contact our accessibility concierge prior to arrival for personalised assistance.',
  },
  {
    question: 'Do you offer airport transfers?',
    answer:
      'Yes, we provide luxury limousine airport transfers to and from all major airports. Transfers should be booked at least 24 hours in advance through our concierge or directly via the guest portal. Round-trip packages are available at a discounted rate for hotel guests.',
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section
      style={{
        background: 'linear-gradient(180deg, #0A0F1E 0%, #060B16 100%)',
        padding: '6rem 0',
      }}
    >
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <p
            style={{
              color: '#C9A84C',
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              fontSize: '0.8rem',
              marginBottom: '0.7rem',
            }}
          >
            Got Questions?
          </p>
          <h2
            style={{
              color: '#ffffff',
              fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            Frequently Asked Questions
          </h2>
        </motion.div>

        {/* Accordion Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                style={{
                  background: '#1A2235',
                  borderRadius: '10px',
                  border: isOpen
                    ? '1px solid rgba(201,168,76,0.55)'
                    : '1px solid rgba(255,255,255,0.07)',
                  overflow: 'hidden',
                  transition: 'border-color 0.3s',
                }}
              >
                {/* Question Button */}
                <button
                  onClick={() => toggle(i)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '1.2rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    gap: '1rem',
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      color: isOpen ? '#C9A84C' : '#ffffff',
                      fontWeight: 600,
                      fontSize: '0.97rem',
                      lineHeight: 1.4,
                      transition: 'color 0.3s',
                    }}
                  >
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ flexShrink: 0 }}
                  >
                    <ChevronDown size={20} color={isOpen ? '#C9A84C' : 'rgba(255,255,255,0.45)'} />
                  </motion.div>
                </button>

                {/* Answer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div
                        style={{
                          padding: '0 1.5rem 1.35rem',
                          borderTop: '1px solid rgba(201,168,76,0.15)',
                          paddingTop: '1rem',
                        }}
                      >
                        <p
                          style={{
                            color: 'rgba(255,255,255,0.65)',
                            fontSize: '0.9rem',
                            lineHeight: 1.75,
                          }}
                        >
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
