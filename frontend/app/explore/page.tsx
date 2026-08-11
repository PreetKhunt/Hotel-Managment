'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Mountain, Utensils, CloudSun, Backpack, ShieldAlert, Bus,
  Search, Heart, Clock, DollarSign, Phone, Sun, Snowflake, CloudRain,
  AlertTriangle, Navigation, CheckCircle2
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
  const { data: weatherData, isLoading: loadingWeather } = useWeatherTips();
  const { data: packingData, isLoading: loadingPacking } = usePackingGuides();
  const { data: transportData, isLoading: loadingTransport } = useTransport();
  const { data: emergencyData, isLoading: loadingEmergency } = useEmergencyContacts();

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
              ) : !placesData?.data?.length ? (
                <EmptyState icon={MapPin} message="No places found." />
              ) : placesData.data.map((place, index) => (
                <PlaceCard key={place.id} data={place} priority={index < 4} />
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
              ) : !activitiesData?.data?.length ? (
                <EmptyState icon={Mountain} message="No activities found." />
              ) : activitiesData.data.map((activity, index) => (
                <ActivityCard key={activity.id} data={activity} priority={index < 4} />
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
              ) : !foodData?.data?.length ? (
                <EmptyState icon={Utensils} message="No food recommendations found." />
              ) : foodData.data.map((food, index) => (
                <FoodCard key={food.id} data={food} priority={index < 4} />
              ))}
            </motion.div>
          )}

          {activeTab === 'weather' && (
            <motion.div
              key="weather"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {loadingWeather ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : !weatherData?.length ? (
                <EmptyState icon={CloudSun} message="Weather information coming soon." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(weatherData as any[]).map((tip: any) => (
                    <WeatherCard key={tip.id} data={tip} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'packing' && (
            <motion.div
              key="packing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {loadingPacking ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : !packingData?.length ? (
                <EmptyState icon={Backpack} message="Packing guide coming soon." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(packingData as any[]).map((guide: any) => (
                    <PackingCard key={guide.id} data={guide} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'transport' && (
            <motion.div
              key="transport"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {loadingTransport ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : !transportData?.length ? (
                <EmptyState icon={Bus} message="Transport information coming soon." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(transportData as any[]).map((item: any) => (
                    <TransportCard key={item.id} data={item} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'emergency' && (
            <motion.div
              key="emergency"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {loadingEmergency ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100">
                      <Skeleton className="h-6 w-1/2 mb-3" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : !emergencyData?.length ? (
                <EmptyState icon={ShieldAlert} message="Emergency contacts coming soon." />
              ) : (
                <div>
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700 text-sm font-medium">In a life-threatening emergency, always call 112 (National Emergency Number) first.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(emergencyData as any[]).map((contact: any) => (
                      <EmergencyCard key={contact.id} data={contact} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SHARED UTILS
// ----------------------------------------------------------------------

function EmptyState({ icon: Icon, message }: { icon: any; message: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-10 h-10" />
      </div>
      <p className="text-slate-500">{message}</p>
    </div>
  );
}

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

function FallbackImage({ alt, icon: Icon }: { alt: string; icon: any }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-100">
      <Icon className="w-12 h-12 mb-2" />
      <span className="text-xs text-slate-400">{alt}</span>
    </div>
  );
}

// ----------------------------------------------------------------------
// CARD COMPONENTS
// ----------------------------------------------------------------------

function PlaceCard({ data, priority = false }: { data: any, priority?: boolean }) {
  const [imgError, setImgError] = useState(false);
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col group cursor-pointer"
    >
      <div className="relative h-56 overflow-hidden bg-slate-100">
        {data.image && !imgError ? (
          <Image 
            src={data.image} 
            alt={data.name} 
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <FallbackImage alt={data.name} icon={MapPin} />
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
          {data.entry_fee > 0 ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <DollarSign className="w-4 h-4 text-amber-500" />
              <span>₹{data.entry_fee} entry</span>
            </div>
          ) : data.is_free_entry ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Free Entry</span>
            </div>
          ) : null}
          {data.opening_time && (
            <div className="flex items-center gap-2 text-slate-500 text-sm col-span-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{data.opening_time} – {data.closing_time}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ActivityCard({ data, priority = false }: { data: any, priority?: boolean }) {
  const [imgError, setImgError] = useState(false);
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col group cursor-pointer"
    >
      <div className="relative h-56 overflow-hidden bg-slate-100">
        {data.image && !imgError ? (
          <Image 
            src={data.image} 
            alt={data.name} 
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <FallbackImage alt={data.name} icon={Mountain} />
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

function FoodCard({ data, priority = false }: { data: any, priority?: boolean }) {
  const [imgError, setImgError] = useState(false);
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col group cursor-pointer"
    >
      <div className="relative h-56 overflow-hidden bg-slate-100">
        {data.image && !imgError ? (
          <Image 
            src={data.image} 
            alt={data.name} 
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <FallbackImage alt={data.name} icon={Utensils} />
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
          {data.category && (
            <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50 w-fit">
              {data.category}
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const seasonIcons: Record<string, any> = {
  Summer: Sun,
  Winter: Snowflake,
  Monsoon: CloudRain,
};

const seasonColors: Record<string, string> = {
  Summer: 'from-amber-400 to-orange-500',
  Winter: 'from-blue-400 to-cyan-500',
  Monsoon: 'from-teal-400 to-emerald-500',
};

function WeatherCard({ data }: { data: any }) {
  const Icon = seasonIcons[data.season] || CloudSun;
  const gradient = seasonColors[data.season] || 'from-slate-400 to-slate-600';

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
    >
      <div className={`bg-gradient-to-br ${gradient} p-6 flex items-center gap-4`}>
        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div>
          <p className="text-white/80 text-sm uppercase tracking-widest font-medium">Season</p>
          <h3 className="text-2xl font-bold text-white">{data.season}</h3>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h4 className="font-semibold text-slate-800 mb-1">{data.title}</h4>
          <p className="text-slate-600 text-sm leading-relaxed">{data.description}</p>
        </div>

        {data.expected_conditions && (
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs uppercase text-blue-500 font-semibold tracking-wider mb-1">Expected Conditions</p>
            <p className="text-blue-800 text-sm">{data.expected_conditions}</p>
          </div>
        )}

        {data.safety_tips && (
          <div className="bg-amber-50 rounded-xl p-3">
            <p className="text-xs uppercase text-amber-600 font-semibold tracking-wider mb-1">Safety Tips</p>
            <p className="text-amber-800 text-sm">{data.safety_tips}</p>
          </div>
        )}

        {data.recommended_items && (
          <div className="bg-emerald-50 rounded-xl p-3">
            <p className="text-xs uppercase text-emerald-600 font-semibold tracking-wider mb-1">What to Carry</p>
            <p className="text-emerald-800 text-sm">{data.recommended_items}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PackingCard({ data }: { data: any }) {
  const Icon = seasonIcons[data.season] || Backpack;
  const gradient = seasonColors[data.season] || 'from-slate-400 to-slate-600';

  const sections = [
    { label: 'Clothing', value: data.clothing, color: 'bg-violet-50 text-violet-800' },
    { label: 'Shoes', value: data.shoes, color: 'bg-blue-50 text-blue-800' },
    { label: 'Accessories', value: data.accessories, color: 'bg-amber-50 text-amber-800' },
    { label: 'Medicine', value: data.medicine, color: 'bg-red-50 text-red-800' },
    { label: 'Travel Essentials', value: data.travel_essentials, color: 'bg-emerald-50 text-emerald-800' },
  ].filter(s => s.value);

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
    >
      <div className={`bg-gradient-to-br ${gradient} p-6 flex items-center gap-4`}>
        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div>
          <p className="text-white/80 text-sm uppercase tracking-widest font-medium">Packing Guide</p>
          <h3 className="text-2xl font-bold text-white">{data.season}</h3>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {sections.map(({ label, value, color }) => (
          <div key={label} className={`${color} rounded-xl p-3`}>
            <p className="text-xs uppercase font-semibold tracking-wider mb-1 opacity-70">{label}</p>
            <p className="text-sm">{value}</p>
          </div>
        ))}
        {data.additional_tips && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <p className="text-xs uppercase font-semibold tracking-wider mb-1 text-slate-500">Pro Tip</p>
            <p className="text-slate-700 text-sm">{data.additional_tips}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TransportCard({ data }: { data: any }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col"
    >
      <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-6 flex items-center gap-4">
        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
          <Bus className="w-8 h-8 text-white" />
        </div>
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">{data.transport_type}</p>
          <h3 className="text-xl font-bold text-white line-clamp-1">{data.provider_name}</h3>
        </div>
      </div>

      <div className="p-6 space-y-3 flex-1">
        {data.description && (
          <p className="text-slate-600 text-sm leading-relaxed">{data.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          {data.estimated_cost > 0 && (
            <div className="bg-emerald-50 rounded-xl p-3">
              <p className="text-xs uppercase text-emerald-600 font-semibold mb-1">Est. Cost</p>
              <p className="text-emerald-800 font-bold">₹{data.estimated_cost}</p>
            </div>
          )}
          {data.opening_hours && (
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs uppercase text-blue-600 font-semibold mb-1">Hours</p>
              <p className="text-blue-800 text-sm font-medium">{data.opening_hours}</p>
            </div>
          )}
        </div>

        {data.phone && (
          <a 
            href={`tel:${data.phone}`}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium mt-2"
          >
            <Phone className="w-4 h-4 text-blue-500" />
            {data.phone}
          </a>
        )}

        {data.distance_from_hotel && (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Navigation className="w-4 h-4 text-slate-400" />
            <span>{data.distance_from_hotel} km from hotel</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

const emergencyCategoryColors: Record<string, string> = {
  Security: 'from-blue-600 to-blue-800',
  Medical: 'from-red-500 to-red-700',
  Emergency: 'from-orange-500 to-red-600',
  Internal: 'from-violet-600 to-violet-800',
  Transport: 'from-slate-600 to-slate-800',
  Information: 'from-emerald-600 to-teal-700',
};

function EmergencyCard({ data }: { data: any }) {
  const gradient = emergencyCategoryColors[data.category] || 'from-slate-600 to-slate-800';

  return (
    <motion.div 
      whileHover={{ y: -3 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 flex"
    >
      <div className={`bg-gradient-to-br ${gradient} w-3 flex-shrink-0`} />
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">{data.category}</p>
            <h3 className="text-lg font-bold text-slate-800">{data.service_name}</h3>
            {data.description && (
              <p className="text-slate-500 text-sm mt-1">{data.description}</p>
            )}
          </div>
          <a 
            href={`tel:${data.phone_number}`}
            className="flex-shrink-0 bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            {data.phone_number}
          </a>
        </div>
      </div>
    </motion.div>
  );
}
