'use client';

import React from 'react';
import { motion } from 'framer-motion';

const GOLD = '#C9A84C';
const GOLD_LIGHT = '#E8C96A';
const TEXT_SECONDARY = '#94A3B8';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
  const progressPercentage = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          fontSize: '13px',
          color: TEXT_SECONDARY,
          fontWeight: 500,
        }}
      >
        <span>
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span style={{ color: GOLD, fontWeight: 700 }}>{progressPercentage}% Complete</span>
      </div>
      <div
        style={{
          width: '100%',
          height: '4px',
          background: 'rgba(148, 163, 184, 0.15)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})`,
            borderRadius: '4px',
          }}
        />
      </div>
    </div>
  );
}
