'use client';

import { motion } from 'framer-motion';
import { UtensilsCrossed, Clock, Coffee, ChefHat, Wine } from 'lucide-react';
import { useState } from 'react';
import RestaurantReservationModal from './RestaurantReservationModal';

const menuHighlights = [
  'Pan-Seared Chilean Sea Bass with Saffron Beurre Blanc',
  'Wagyu Beef Tenderloin with Truffle Jus & Seasonal Vegetables',
  'Lobster Thermidor with Gruyère Crust',
  'Deconstructed Crème Brûlée with Madagascar Vanilla',
];

const roomServiceCards = [
  {
    icon: UtensilsCrossed,
    title: '24/7 In-Room Dining',
    description: 'Enjoy a full à-la-carte menu delivered directly to your suite around the clock.',
  },
  {
    icon: Coffee,
    title: 'Express Breakfast',
    description: 'Wake up to a curated breakfast basket ready at your door by 7 AM.',
  },
  {
    icon: Wine,
    title: 'Premium Mini Bar',
    description: 'Hand-selected wines, spirits, and artisanal snacks stocked fresh daily.',
  },
];

export default function RestaurantSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section style={{ background: '#0A0F1E', padding: '6rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Main Restaurant Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '4rem',
            alignItems: 'center',
            marginBottom: '5rem',
          }}
        >
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p
              style={{
                color: '#C9A84C',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontSize: '0.8rem',
                marginBottom: '0.75rem',
              }}
            >
              Fine Dining
            </p>
            <h2
              style={{
                color: '#ffffff',
                fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                fontWeight: 700,
                marginBottom: '1.25rem',
                lineHeight: 1.2,
              }}
            >
              The Grand Table
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.65)',
                lineHeight: 1.75,
                marginBottom: '1.75rem',
                fontSize: '1rem',
              }}
            >
              Our Michelin-starred restaurant invites you to experience an extraordinary culinary
              journey. Executive Chef Antoine Morel crafts each dish using the finest seasonal
              ingredients sourced from local artisan producers, paired with an award-winning wine
              cellar of over 1,200 labels.
            </p>

            {/* Menu Highlights */}
            <div style={{ marginBottom: '1.75rem' }}>
              <p
                style={{
                  color: '#C9A84C',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <ChefHat size={16} color="#C9A84C" />
                Signature Dishes
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {menuHighlights.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      color: 'rgba(255,255,255,0.75)',
                      fontSize: '0.9rem',
                      padding: '0.45rem 0',
                      paddingLeft: '1.2rem',
                      position: 'relative',
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#C9A84C',
                        fontSize: '1rem',
                        lineHeight: 1,
                      }}
                    >
                      ✦
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Opening Hours */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'rgba(255,255,255,0.55)',
                fontSize: '0.88rem',
                marginBottom: '2rem',
              }}
            >
              <Clock size={15} color="#C9A84C" />
              <span>Breakfast 7–10 AM &nbsp;|&nbsp; Lunch 12–3 PM &nbsp;|&nbsp; Dinner 6–11 PM</span>
            </div>

            {/* Reserve Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #C9A84C, #a8863c)',
                color: '#0A0F1E',
                border: 'none',
                padding: '0.85rem 2.2rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                letterSpacing: '0.03em',
              }}
            >
              Reserve a Table
            </motion.button>
          </motion.div>

          {/* Right: Image */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ position: 'relative' }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-12px',
                right: '-12px',
                bottom: '12px',
                left: '12px',
                border: '2px solid #C9A84C',
                borderRadius: '14px',
                opacity: 0.5,
              }}
            />
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"
              alt="Fine Dining Restaurant"
              style={{
                width: '100%',
                height: '420px',
                objectFit: 'cover',
                borderRadius: '12px',
                display: 'block',
                position: 'relative',
                zIndex: 1,
              }}
            />
          </motion.div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)',
            marginBottom: '4rem',
          }}
        />

        {/* Room Service Sub-Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '2.5rem' }}
        >
          <p
            style={{
              color: '#C9A84C',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontSize: '0.8rem',
              marginBottom: '0.6rem',
            }}
          >
            In-Room
          </p>
          <h3
            style={{
              color: '#ffffff',
              fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
              fontWeight: 700,
            }}
          >
            Room Service Excellence
          </h3>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {roomServiceCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ translateY: -4 }}
                style={{
                  background: '#1A2235',
                  borderRadius: '12px',
                  padding: '2rem',
                  border: '1px solid rgba(201,168,76,0.15)',
                  transition: 'border-color 0.3s',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.5)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.15)')
                }
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '12px',
                    background: 'rgba(201,168,76,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.1rem',
                  }}
                >
                  <Icon size={24} color="#C9A84C" />
                </div>
                <h4
                  style={{ color: '#ffffff', fontWeight: 600, marginBottom: '0.5rem', fontSize: '1rem' }}
                >
                  {card.title}
                </h4>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem', lineHeight: 1.65 }}>
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      <RestaurantReservationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
}
