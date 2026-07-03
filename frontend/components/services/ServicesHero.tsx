'use client';

import { motion } from 'framer-motion';

export default function ServicesHero() {
  return (
    <section
      style={{
        position: 'relative',
        height: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background Image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Dark Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(10,15,30,0.88) 0%, rgba(10,15,30,0.70) 100%)',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 1.5rem' }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            color: '#C9A84C',
            fontWeight: 600,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}
        >
          Our Services
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          style={{
            color: '#ffffff',
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            letterSpacing: '-0.01em',
          }}
        >
          World-Class{' '}
          <span style={{ color: '#C9A84C' }}>Experiences</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          style={{
            color: 'rgba(255,255,255,0.72)',
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            maxWidth: '560px',
            margin: '0 auto',
            lineHeight: 1.7,
          }}
        >
          From exquisite dining to rejuvenating spa treatments, every detail is crafted to elevate
          your stay into an unforgettable luxury journey.
        </motion.p>

        {/* Decorative gold line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{
            width: '80px',
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
            margin: '1.75rem auto 0',
            borderRadius: '2px',
          }}
        />
      </div>
    </section>
  );
}
