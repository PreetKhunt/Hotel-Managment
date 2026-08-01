'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StayMatchPreferences,
  QuestionConfig,
  STAY_MATCH_QUESTIONS,
  INITIAL_PREFERENCES,
} from '@/lib/stay-match';

// ─── Luxury Branding Palette ──────────────────────────────────────────────────
const GOLD = '#C9A84C';
const GOLD_LIGHT = '#E8C96A';
const BG_OVERLAY = 'rgba(5, 8, 16, 0.85)';
const CARD_BG = '#1A2235';
const CARD_BG_ACTIVE = 'rgba(201, 168, 76, 0.12)';
const TEXT_PRIMARY = '#F8FAFC';
const TEXT_SECONDARY = '#94A3B8';
const BORDER_DEFAULT = 'rgba(148, 163, 184, 0.18)';
const BORDER_GOLD = 'rgba(201, 168, 76, 0.5)';

interface StayMatchWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (preferences: StayMatchPreferences) => void;
  initialPreferences?: StayMatchPreferences | null;
}

export default function StayMatchWizard({
  isOpen,
  onClose,
  onComplete,
  initialPreferences,
}: StayMatchWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [preferences, setPreferences] = useState<StayMatchPreferences>(
    initialPreferences || INITIAL_PREFERENCES
  );

  const modalRef = useRef<HTMLDivElement>(null);
  const questions: QuestionConfig[] = STAY_MATCH_QUESTIONS;
  const currentQuestion = questions[currentStep] || questions[0];
  const totalSteps = questions.length;

  // Sync preferences if initialPreferences change on open
  useEffect(() => {
    if (isOpen) {
      setPreferences(initialPreferences || INITIAL_PREFERENCES);
      setCurrentStep(0);
      // Auto focus modal for accessible keyboard interactions
      setTimeout(() => {
        modalRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialPreferences]);

  // Validation to verify required step completion before enabling Next
  const isStepValid = useMemo(() => {
    if (!currentQuestion || !currentQuestion.required) return true;
    const value = preferences[currentQuestion.id];
    if (value === undefined || value === null) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }, [currentQuestion, preferences]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (!isStepValid) return;
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete(preferences);
    }
  }, [isStepValid, currentStep, totalSteps, onComplete, preferences]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Accessible Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        // Prevent enter on focused buttons from double firing if they are already standard triggers
        if (
          document.activeElement?.tagName === 'BUTTON' &&
          document.activeElement?.getAttribute('type') === 'button'
        ) {
          return;
        }
        e.preventDefault();
        if (isStepValid) handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, isStepValid]);

  if (!isOpen) return null;

  // Update value for the current field
  const handleValueChange = (val: unknown) => {
    setPreferences((prev) => ({
      ...prev,
      [currentQuestion.id]: val,
    }));
  };

  // Toggle array item for multi-select checkboxes
  const handleArrayToggle = (itemValue: string) => {
    const currentArray = (preferences[currentQuestion.id] as string[]) || [];
    const nextArray = currentArray.includes(itemValue)
      ? currentArray.filter((v) => v !== itemValue)
      : [...currentArray, itemValue];
    handleValueChange(nextArray);
  };

  const progressPercentage = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: BG_OVERLAY,
            backdropFilter: 'blur(8px)',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="wizard-title"
          aria-describedby="wizard-subtitle"
        >
          {/* Responsive Modal / Mobile Bottom Sheet */}
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: '100%',
              maxWidth: '740px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              background: '#0D1526',
              borderRadius: '24px',
              border: `1px solid ${BORDER_GOLD}`,
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.7)',
              outline: 'none',
              overflow: 'hidden',
              position: 'relative',
            }}
            className="sm:rounded-3xl max-h-[88vh]"
          >
            {/* ── Header ── */}
            <div style={{ padding: '28px 32px 20px', borderBottom: `1px solid ${BORDER_DEFAULT}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>✨</span>
                  <span style={{ color: GOLD, fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Intelligent Stay Match
                  </span>
                </div>
                <button
                  onClick={onClose}
                  type="button"
                  aria-label="Close Wizard"
                  style={{
                    background: 'rgba(148, 163, 184, 0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    color: TEXT_SECONDARY,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '18px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#F87171')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = TEXT_SECONDARY)}
                >
                  ✕
                </button>
              </div>

              {/* Progress Bar & Step Indicator */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '13px', color: TEXT_SECONDARY, fontWeight: 500 }}>
                <span>Step {currentStep + 1} of {totalSteps}</span>
                <span style={{ color: GOLD, fontWeight: 700 }}>{progressPercentage}% Complete</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(148, 163, 184, 0.15)', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  style={{ height: '100%', background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})`, borderRadius: '4px' }}
                />
              </div>
            </div>

            {/* ── Question Body ── */}
            <div style={{ padding: '32px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 id="wizard-title" style={{ margin: '0 0 8px', color: TEXT_PRIMARY, fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-playfair), Georgia, serif', lineHeight: 1.25 }}>
                  {currentQuestion.title}
                  {currentQuestion.required && <span style={{ color: '#EF4444', marginLeft: '6px', fontSize: '18px' }}>*</span>}
                </h2>
                <p id="wizard-subtitle" style={{ margin: 0, color: TEXT_SECONDARY, fontSize: '14.5px', lineHeight: 1.6 }}>
                  {currentQuestion.subtitle}
                </p>
              </div>

              {/* Input Type Handling */}
              <div style={{ flex: 1 }}>
                {/* 1. Single Card Selector */}
                {currentQuestion.type === 'single-card' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                    {currentQuestion.options.map((opt) => {
                      const isSelected = preferences[currentQuestion.id] === opt.value;
                      return (
                        <button
                          key={String(opt.value)}
                          type="button"
                          onClick={() => handleValueChange(opt.value)}
                          style={{
                            textAlign: 'left',
                            padding: '16px',
                            borderRadius: '16px',
                            background: isSelected ? CARD_BG_ACTIVE : CARD_BG,
                            border: `2px solid ${isSelected ? GOLD : BORDER_DEFAULT}`,
                            color: TEXT_PRIMARY,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            boxShadow: isSelected ? '0 8px 24px rgba(201, 168, 76, 0.15)' : 'none',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(201, 168, 76, 0.35)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER_DEFAULT;
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <span style={{ fontSize: '24px' }}>{opt.icon}</span>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: `2px solid ${isSelected ? GOLD : 'rgba(148, 163, 184, 0.4)'}`,
                              background: isSelected ? GOLD : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              {isSelected && (
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0D1526' }} />
                              )}
                            </div>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '15px', color: isSelected ? GOLD_LIGHT : TEXT_PRIMARY }}>
                            {opt.label}
                          </div>
                          {opt.description && (
                            <div style={{ fontSize: '12.5px', color: TEXT_SECONDARY, lineHeight: 1.45 }}>
                              {opt.description}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. Number Selector Toggle */}
                {currentQuestion.type === 'number-selector' && (
                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    {currentQuestion.options.map((opt) => {
                      const isSelected = preferences[currentQuestion.id] === opt.value;
                      return (
                        <button
                          key={String(opt.value)}
                          type="button"
                          onClick={() => handleValueChange(opt.value)}
                          style={{
                            flex: '1',
                            minWidth: '130px',
                            padding: '20px 16px',
                            borderRadius: '16px',
                            background: isSelected ? 'linear-gradient(135deg, rgba(201, 168, 76, 0.25), rgba(201, 168, 76, 0.1))' : CARD_BG,
                            border: `2px solid ${isSelected ? GOLD : BORDER_DEFAULT}`,
                            color: isSelected ? GOLD_LIGHT : TEXT_PRIMARY,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: 700,
                            fontSize: '16px',
                            transition: 'all 0.2s ease',
                            boxShadow: isSelected ? '0 8px 24px rgba(201, 168, 76, 0.2)' : 'none',
                          }}
                        >
                          <span style={{ fontSize: '28px' }}>{opt.icon}</span>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 3. Checkbox Grid */}
                {currentQuestion.type === 'checkbox-grid' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '12px' }}>
                    {currentQuestion.options.map((opt) => {
                      const valStr = String(opt.value);
                      const currentArr = (preferences[currentQuestion.id] as string[]) || [];
                      const isChecked = currentArr.includes(valStr);
                      return (
                        <button
                          key={valStr}
                          type="button"
                          onClick={() => handleArrayToggle(valStr)}
                          style={{
                            textAlign: 'left',
                            padding: '14px 16px',
                            borderRadius: '12px',
                            background: isChecked ? CARD_BG_ACTIVE : CARD_BG,
                            border: `1.5px solid ${isChecked ? GOLD : BORDER_DEFAULT}`,
                            color: isChecked ? TEXT_PRIMARY : TEXT_SECONDARY,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontWeight: isChecked ? 600 : 400,
                            fontSize: '14px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{ fontSize: '20px', flexShrink: 0 }}>{opt.icon || '✦'}</span>
                          <span style={{ flex: 1 }}>{opt.label}</span>
                          <span style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '5px',
                            border: `2px solid ${isChecked ? GOLD : 'rgba(148, 163, 184, 0.3)'}`,
                            background: isChecked ? GOLD : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            {isChecked && (
                              <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                                <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#0A0F1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── Footer / Navigation Controls ── */}
            <div style={{
              padding: '20px 32px',
              borderTop: `1px solid ${BORDER_DEFAULT}`,
              background: '#0B111E',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
            }}>
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  background: 'transparent',
                  color: currentStep === 0 ? 'rgba(148, 163, 184, 0.3)' : TEXT_PRIMARY,
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                ← Previous
              </button>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {!currentQuestion.required && (
                  <span style={{ fontSize: '12px', color: TEXT_SECONDARY }}>Optional</span>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid}
                  style={{
                    padding: '12px 36px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isStepValid
                      ? `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`
                      : 'rgba(148, 163, 184, 0.15)',
                    color: isStepValid ? '#0A0F1E' : 'rgba(148, 163, 184, 0.4)',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: isStepValid ? 'pointer' : 'not-allowed',
                    boxShadow: isStepValid ? '0 4px 20px rgba(201, 168, 76, 0.35)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {currentStep === totalSteps - 1 ? 'Find Matching Rooms ✨' : 'Next Step →'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
