'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Dumbbell, Users, Activity, Heart, Shield, ArrowRight } from 'lucide-react';
import FitnessBookingModal from '@/components/services/FitnessBookingModal';
import TopLeftBackButton from '@/components/shared/TopLeftBackButton';

export default function FitnessPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const handleBook = (service: string = '') => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#060B16] pt-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden mb-20">
        <TopLeftBackButton className="absolute top-4 left-4 sm:top-8 sm:left-8 z-50" />
        
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000" 
            alt="Elite Fitness Centre" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060B16] via-[#060B16]/80 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#C9A84C] font-bold tracking-[0.2em] uppercase text-sm mb-6"
          >
            Hospitality Hub Wellness
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Elite Fitness Centre
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Push your limits in our state-of-the-art facility featuring Technogym equipment, dedicated functional zones, and expert personal trainers.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => handleBook()}
            className="px-8 py-4 bg-gradient-to-r from-[#C9A84C] to-[#A07A2E] text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all"
          >
            Schedule a Session
          </motion.button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Facilities Grid */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">World-Class Facilities</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Everything you need to maintain your fitness routine while away from home.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                title: 'Cardio Zone',
                desc: 'Latest Technogym treadmills, ellipticals, and bikes with immersive virtual routes.'
              },
              {
                icon: Dumbbell,
                title: 'Strength & Free Weights',
                desc: 'Comprehensive range of pin-loaded machines, Olympic racks, and dumbbells up to 50kg.'
              },
              {
                icon: Shield,
                title: 'Functional Training',
                desc: 'Dedicated turf area with TRX, kettlebells, plyo boxes, and battle ropes.'
              },
              {
                icon: Heart,
                title: 'Yoga Studio',
                desc: 'Tranquil space for stretching, yoga, and meditation with premium mats and props.'
              },
              {
                icon: Users,
                title: 'Personal Training',
                desc: 'Certified elite trainers available for bespoke 1-on-1 coaching sessions.'
              },
              {
                icon: CheckCircle2,
                title: 'Recovery',
                desc: 'Luxurious locker rooms featuring eucalyptus steam rooms and dry saunas.'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#0A0F1E] border border-[rgba(201,168,76,0.15)] rounded-2xl p-8 hover:border-[#C9A84C]/40 transition-colors group"
              >
                <div className="w-14 h-14 rounded-xl bg-[rgba(201,168,76,0.1)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-[#C9A84C]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Programs / PT */}
        <section className="mb-24">
          <div className="bg-[#0A0F1E] border border-[rgba(201,168,76,0.2)] rounded-3xl overflow-hidden flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-white mb-6">Expert Personal Training</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Elevate your workouts with our certified trainers. Whether you want to improve your technique, build strength, or stay accountable, we offer customized programs tailored exactly to your goals.
              </p>
              <ul className="space-y-4 mb-10">
                {['Body Composition Analysis', 'Customized Workout Plans', 'Nutritional Guidance', 'Injury Rehabilitation'].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-[#C9A84C] mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handleBook('Personal Training')}
                className="flex items-center justify-center gap-2 w-fit px-8 py-4 bg-transparent border-2 border-[#C9A84C] text-[#C9A84C] rounded-lg font-semibold hover:bg-[#C9A84C] hover:text-[#060B16] transition-all"
              >
                Book Personal Trainer
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="lg:w-1/2 h-64 lg:h-auto">
              <img 
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000" 
                alt="Personal Training" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Info & Policy */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="bg-[#1A2235] p-10 rounded-3xl">
            <h3 className="text-2xl font-bold text-white mb-6">Opening Hours</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.05)] pb-4">
                <span className="text-gray-400">Monday - Friday</span>
                <span className="text-white font-medium">5:00 AM - 11:00 PM</span>
              </div>
              <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.05)] pb-4">
                <span className="text-gray-400">Weekends</span>
                <span className="text-white font-medium">6:00 AM - 10:00 PM</span>
              </div>
              <div className="flex justify-between items-center pb-4">
                <span className="text-gray-400">Personal Training</span>
                <span className="text-white font-medium">By Appointment</span>
              </div>
            </div>
            <div className="mt-8 p-4 bg-[rgba(201,168,76,0.1)] rounded-xl border border-[rgba(201,168,76,0.2)]">
              <p className="text-sm text-[#C9A84C]">
                <strong>Hotel Guests:</strong> Enjoy complimentary 24/7 access using your room key card.
              </p>
            </div>
          </div>

          <div className="bg-[#1A2235] p-10 rounded-3xl">
            <h3 className="text-2xl font-bold text-white mb-6">Policies & Information</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-semibold mb-2">Age Requirements</h4>
                <p className="text-gray-400 text-sm">Guests must be 16 years or older to use the fitness centre independently.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Attire</h4>
                <p className="text-gray-400 text-sm">Appropriate athletic attire and closed-toe sports shoes are required at all times.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Contact Reception</h4>
                <p className="text-gray-400 text-sm mb-4">Need help or want to sign up for a membership?</p>
                <button 
                  onClick={() => alert("Contact Reception at extension 400 or fitness@hospitalityhub.com")}
                  className="text-[#C9A84C] font-semibold hover:underline"
                >
                  fitness@hospitalityhub.com
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>

      <FitnessBookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        defaultService={selectedService}
      />
    </main>
  );
}
