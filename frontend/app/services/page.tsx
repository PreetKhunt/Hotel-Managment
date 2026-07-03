'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ServicesHero from '@/components/services/ServicesHero';
import RestaurantSection from '@/components/services/RestaurantSection';
import SpaGymSection from '@/components/services/SpaGymSection';
import FacilitiesGrid from '@/components/services/FacilitiesGrid';
import FAQAccordion from '@/components/services/FAQAccordion';

export default function ServicesPage() {
  return (
    <div style={{ background: '#0A0F1E' }}>
      <Navbar />
      <ServicesHero />
      <RestaurantSection />
      <SpaGymSection />
      <FacilitiesGrid />
      <FAQAccordion />
      <Footer />
    </div>
  );
}
