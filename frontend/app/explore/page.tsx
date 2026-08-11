'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Mountain, Utensils, CloudSun, Backpack, ShieldAlert, Bus,
  Search, ArrowRight, Heart, Clock, DollarSign, Star
} from 'lucide-react';
import { 
  usePlaces, useActivities, useFoods, useWeatherTips, 
  usePackingGuides, useEmergencyContacts, useTransport 
} from '@/hooks/useManali';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const categories = [
  { id: 'places', label: 'Places to Visit', icon: MapPin },
  { id: 'activities', label: 'Activities', icon: Mountain },
  { id: 'food', label: 'Local Food', icon: Utensils },
  { id: 'weather', label: 'Weather Info', icon: CloudSun },
  { id: 'packing', label: 'Packing Guide', icon: Backpack },
  { id: 'transport', label: 'Transport', icon: Bus },
  { id: 'emergency', label: 'Emergency', icon: ShieldAlert },
];

export default function ExploreManaliPage() {
  const [activeTab, setActiveTab] = useState('places');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: placesData, isLoading: loadingPlaces } = usePlaces({ search: searchQuery });
  const { data: activitiesData, isLoading: loadingActivities } = useActivities({ search: searchQuery });
  const { data: foodData, isLoading: loadingFood } = useFoods({ search: searchQuery });
  const { data: weatherData } = useWeatherTips();
  const { data: packingData } = usePackingGuides();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <div className="relative h-[400px] sm:h-[500px] w-full bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605649487212-4dcfd3957eb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        
        <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight"
          >
            Explore Manali
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-300 max-w-2xl mb-8"
          >
            Your ultimate smart destination guide. Discover hidden gems, thrilling adventures, and local flavors curated exclusively for our guests.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-xl"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search places, activities, or food..." 
              className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-slate-400 text-lg rounded-2xl backdrop-blur-md focus:bg-white/20 transition-all"
            />
          </motion.div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto py-4 hide-scrollbar gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all whitespace-nowrap ${
                  activeTab === cat.id 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'places' && (
            <motion.div
              key="places"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {loadingPlaces ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              ) : placesData?.data.map((place) => (
                <PlaceCard key={place.id} data={place} />
              ))}
            </motion.div>
          )}

          {activeTab === 'activities' && (
            <motion.div
              key="activities"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {loadingActivities ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              ) : activitiesData?.data.map((activity) => (
                <ActivityCard key={activity.id} data={activity} />
              ))}
            </motion.div>
          )}

          {activeTab === 'food' && (
            <motion.div
              key="food"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {loadingFood ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              ) : foodData?.data.map((food) => (
                <FoodCard key={food.id} data={food} />
              ))}
            </motion.div>
          )}
          
          {/* Implement other tabs similarly... */}
          {(activeTab === 'weather' || activeTab === 'packing' || activeTab === 'transport' || activeTab === 'emergency') && (
            <motion.div
              key="other"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <MapPin className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">Detailed Information Coming Soon</h2>
              <p className="text-slate-500 max-w-md">The destination guide for this section is being populated by our local experts.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// COMPONENTS
// ----------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-full">
      <Skeleton className="w-full h-48 rounded-none" />
      <div className="p-6 flex-1 flex flex-col gap-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="mt-auto pt-4 flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

function PlaceCard({ data }: { data: any }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col group cursor-pointer"
    >
      <div className="relative h-56 overflow-hidden bg-slate-100">
        {data.image ? (
          <img src={data.image} alt={data.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <MapPin className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-rose-50 hover:text-rose-500 transition-colors">
          <Heart className="w-5 h-5" />
        </div>
        <div className="absolute top-4 left-4">
          <Badge className="bg-slate-900/80 backdrop-blur-sm hover:bg-slate-900 border-none px-3 py-1 text-xs">
            {data.category}
          </Badge>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">{data.name}</h3>
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{data.description}</p>
        
        <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          {data.distance_from_hotel && (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>{data.distance_from_hotel} km away</span>
            </div>
          )}
          {data.opening_time && (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{data.opening_time} - {data.closing_time}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ActivityCard({ data }: { data: any }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col group cursor-pointer"
    >
      <div className="relative h-56 overflow-hidden bg-slate-100">
        {data.image ? (
          <img src={data.image} alt={data.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Mountain className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-rose-50 hover:text-rose-500 transition-colors">
          <Heart className="w-5 h-5" />
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-slate-800 line-clamp-1">{data.name}</h3>
          {data.difficulty && (
            <Badge variant="outline" className={`
              ${data.difficulty === 'Easy' ? 'border-green-200 text-green-700 bg-green-50' : ''}
              ${data.difficulty === 'Moderate' ? 'border-amber-200 text-amber-700 bg-amber-50' : ''}
              ${data.difficulty === 'Hard' ? 'border-red-200 text-red-700 bg-red-50' : ''}
            `}>
              {data.difficulty}
            </Badge>
          )}
        </div>
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{data.description}</p>
        
        <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          {data.approximate_cost > 0 && (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span>~₹{data.approximate_cost}</span>
            </div>
          )}
          {data.duration && (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{data.duration}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function FoodCard({ data }: { data: any }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col group cursor-pointer"
    >
      <div className="relative h-56 overflow-hidden bg-slate-100">
        {data.image ? (
          <img src={data.image} alt={data.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Utensils className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          {data.veg_non_veg === 'Veg' && (
            <span className="w-6 h-6 bg-white rounded flex items-center justify-center border-2 border-green-600">
              <span className="w-3 h-3 bg-green-600 rounded-full"></span>
            </span>
          )}
          {data.veg_non_veg === 'Non-Veg' && (
            <span className="w-6 h-6 bg-white rounded flex items-center justify-center border-2 border-red-600">
              <span className="w-3 h-3 bg-red-600 rounded-full"></span>
            </span>
          )}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">{data.name}</h3>
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{data.description}</p>
        
        {data.recommended_restaurant && (
          <div className="mb-4 text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Best at</span>
            {data.recommended_restaurant}
          </div>
        )}
        
        <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          {data.approximate_cost > 0 && (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span>~₹{data.approximate_cost}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
