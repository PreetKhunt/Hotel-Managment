'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BackToHomeButton() {
  const pathname = usePathname();

  // Hide on home page
  if (pathname === '/') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 9999,
        }}
      >
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(201,168,76,0.2)' }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '50%',
              background: '#1A2235', // Match CARD_BG from theme
              border: '1px solid rgba(201,168,76,0.4)', // Gold border
              color: '#C9A84C', // Gold icon
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
            }}
            title="Back to Home"
            aria-label="Back to Home"
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,168,76,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
            }}
          >
            <Home size={22} strokeWidth={2.5} />
          </motion.button>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
