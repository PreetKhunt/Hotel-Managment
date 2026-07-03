'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';
import SpaBookingModal from './SpaBookingModal';

const spaTreatments = ['Deep Tissue Massage', 'Luxury Facial', 'Seaweed Body Wrap', 'Aromatherapy Journey'];
const gymFacilities = ['State-of-Art Equipment', 'Personal Trainers', 'Yoga & Pilates Classes', 'Heated Indoor Pool'];

interface ServiceCardProps {
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  listItems: string[];
  buttonLabel: string;
  delay?: number;
  onButtonClick: () => void;
}

function ServiceCard({ image, eyebrow, title, description, listItems, buttonLabel, delay = 0, onButtonClick }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay }}
      style={{
        background: '#1A2235',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(201,168,76,0.2)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
        <img
          src={image}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(26,34,53,0.85) 0%, transparent 55%)',
          }}
        />
        {/* Gold top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #C9A84C, rgba(201,168,76,0.3))',
          }}
        />
      </div>

      {/* Content */}
      <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p
          style={{
            color: '#C9A84C',
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            marginBottom: '0.5rem',
          }}
        >
          {eyebrow}
        </p>
        <h3
          style={{
            color: '#ffffff',
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '0.85rem',
            lineHeight: 1.2,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.9rem',
            lineHeight: 1.7,
            marginBottom: '1.25rem',
          }}
        >
          {description}
        </p>

        {/* List */}
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', flex: 1 }}>
          {listItems.map((item, i) => (
            <li
              key={i}
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.88rem',
                padding: '0.35rem 0',
                paddingLeft: '1.2rem',
                position: 'relative',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  color: '#C9A84C',
                  fontWeight: 700,
                }}
              >
                ✦
              </span>
              {item}
            </li>
          ))}
        </ul>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onButtonClick}
          style={{
            background: 'transparent',
            color: '#C9A84C',
            border: '1.5px solid #C9A84C',
            padding: '0.75rem 1.75rem',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            letterSpacing: '0.03em',
            alignSelf: 'flex-start',
            transition: 'background 0.25s, color 0.25s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#C9A84C';
            (e.currentTarget as HTMLButtonElement).style.color = '#0A0F1E';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = '#C9A84C';
          }}
        >
          {buttonLabel}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function SpaGymSection() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState('');

  const openModal = (treatment = '') => {
    setSelectedTreatment(treatment);
    setIsModalOpen(true);
  };

  return (
    <section
      style={{
        background: 'linear-gradient(180deg, #060B16 0%, #0A0F1E 100%)',
        padding: '6rem 0',
      }}
    >
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
            Wellness & Fitness
          </p>
          <h2
            style={{
              color: '#ffffff',
              fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            Rejuvenate Body & Mind
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '1rem',
              maxWidth: '500px',
              margin: '0.85rem auto 0',
              lineHeight: 1.7,
            }}
          >
            Unwind in our award-winning spa or push your limits in our elite fitness center—crafted
            for guests who demand the very best.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          <ServiceCard
            image="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800"
            eyebrow="Wellness"
            title="Serenity Spa"
            description="Step into a world of tranquillity where expert therapists blend ancient healing traditions with modern techniques. Our spa sanctuary is designed to restore harmony to your body, mind, and spirit."
            listItems={spaTreatments}
            buttonLabel="Book Treatment"
            onButtonClick={() => openModal()}
            delay={0}
          />
          <ServiceCard
            image="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
            eyebrow="Fitness"
            title="Elite Fitness Center"
            description="Our state-of-the-art fitness center is equipped with the latest Technogym machines and staffed by certified personal trainers ready to support your goals—whether you're a seasoned athlete or just beginning."
            listItems={gymFacilities}
            buttonLabel="Learn More"
            onButtonClick={() => router.push('/fitness')}
            delay={0.15}
          />
        </div>
      </div>

      <SpaBookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        defaultTreatment={selectedTreatment}
      />
    </section>
  );
}
