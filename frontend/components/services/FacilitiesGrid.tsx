'use client';

import { motion } from 'framer-motion';
import {
  Waves,
  Presentation,
  Briefcase,
  Baby,
  PartyPopper,
  GlassWater,
  Car,
  PlaneTakeoff,
} from 'lucide-react';

const facilities = [
  {
    icon: Waves,
    title: 'Infinity Pool',
    description: 'Heated outdoor infinity pool with panoramic city views, open year-round.',
  },
  {
    icon: Presentation,
    title: 'Conference Rooms',
    description: 'Six fully-equipped conference suites for up to 300 delegates.',
  },
  {
    icon: Briefcase,
    title: 'Business Center',
    description: 'Fully equipped 24/7 business lounge with high-speed fibre internet.',
  },
  {
    icon: Baby,
    title: "Kids' Club",
    description: 'Supervised activities and entertainment for children aged 4–12.',
  },
  {
    icon: PartyPopper,
    title: 'Wedding Hall',
    description: 'Grand ballroom accommodating 500 guests for unforgettable celebrations.',
  },
  {
    icon: GlassWater,
    title: 'Rooftop Bar',
    description: 'Signature cocktails and sunset views from our exclusive rooftop terrace.',
  },
  {
    icon: Car,
    title: 'Valet Parking',
    description: 'Complimentary valet parking for hotel guests with 24/7 access.',
  },
  {
    icon: PlaneTakeoff,
    title: 'Airport Shuttle',
    description: 'Luxury limousine transfers between the hotel and all major airports.',
  },
];

export default function FacilitiesGrid() {
  return (
    <section style={{ background: '#0A0F1E', padding: '6rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}
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
            Amenities
          </p>
          <h2
            style={{
              color: '#ffffff',
              fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: '0.85rem',
            }}
          >
            Hotel Facilities
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '1rem',
              maxWidth: '480px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Every convenience thoughtfully provided, so you can focus entirely on the pleasure of
            your stay.
          </p>
        </motion.div>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {facilities.map((facility, i) => {
            const Icon = facility.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.1 }}
                style={{
                  background: '#1A2235',
                  borderRadius: '12px',
                  padding: '1.75rem',
                  border: '1px solid rgba(201,168,76,0.12)',
                  cursor: 'default',
                  transition: 'border-color 0.3s, transform 0.3s',
                }}
                whileHover={{ scale: 1.02, borderColor: 'rgba(201,168,76,0.5)' } as any}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.5)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.12)')
                }
              >
                {/* Icon Circle */}
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid rgba(201,168,76,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.1rem',
                  }}
                >
                  <Icon size={22} color="#C9A84C" />
                </div>

                <h4
                  style={{
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '1rem',
                    marginBottom: '0.45rem',
                  }}
                >
                  {facility.title}
                </h4>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.52)',
                    fontSize: '0.85rem',
                    lineHeight: 1.65,
                  }}
                >
                  {facility.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
