'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Tag, Search, ArrowRight, Gift, Percent, 
  MapPin, Clock, ShieldCheck, Ticket
} from 'lucide-react';
import { useShops, useOffers, useGenerateCoupon } from '@/hooks/useShopping';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function ShoppingDealsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  
  const router = useRouter();

  const { data: shopsData, isLoading: loadingShops } = useShops({ search: searchQuery });
  const { data: offersData, isLoading: loadingOffers } = useOffers({ shop_id: selectedShop || undefined, active_only: true });
  
  const generateCoupon = useGenerateCoupon();

  const handleClaimOffer = async (offerId: string) => {
    try {
      await generateCoupon.mutateAsync(offerId);
      toast.success("Coupon Generated Successfully! You can find your coupon in the dashboard.");
      // Optionally redirect or show modal
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Please login to claim offers.");
      if (error?.response?.status === 401) {
        router.push('/login?callbackUrl=/shopping-deals');
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Hero Section */}
      <div className="relative h-[350px] sm:h-[450px] w-full bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/40 to-fuchsia-900/40 mix-blend-multiply"></div>
        
        <div className="relative h-full container mx-auto px-4 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-sm font-medium w-fit mb-6"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified Hotel Guest Exclusive</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight"
          >
            Partner Deals
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-300 max-w-2xl mb-8"
          >
            Unlock exclusive discounts and complimentary services at Manali's premium boutiques, cafes, and rental shops.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar / Filters */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-slate-400" />
                Find Brands
              </h3>
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shops or brands..." 
                className="bg-surface border-gold/10 h-12 rounded-xl mb-6"
              />
              
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-slate-400" />
                Partner Shops
              </h3>
              
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <button
                  onClick={() => setSelectedShop(null)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    selectedShop === null 
                      ? 'bg-gold/10 text-gold border border-gold/20 border border-gold/20' 
                      : 'text-secondary hover:bg-surface'
                  }`}
                >
                  All Offers
                </button>
                {loadingShops ? (
                  Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)
                ) : (
                  shopsData?.data.map(shop => (
                    <button
                      key={shop.id}
                      onClick={() => setSelectedShop(shop.id)}
                      className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex flex-col ${
                        selectedShop === shop.id 
                          ? 'bg-gold/10 text-gold border border-gold/20 border border-gold/20' 
                          : 'text-secondary hover:bg-surface'
                      }`}
                    >
                      <span className="line-clamp-1">{shop.brand_name || shop.shop_name}</span>
                      <span className="text-xs font-normal opacity-70">{shop.category}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Offers Grid */}
          <div className="lg:col-span-9">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-primary">
                  {selectedShop 
                    ? shopsData?.data.find(s => s.id === selectedShop)?.brand_name || shopsData?.data.find(s => s.id === selectedShop)?.shop_name 
                    : 'All Exclusive Offers'
                  }
                </h2>
                <p className="text-secondary mt-1">Claim coupons to show at the store</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loadingOffers ? (
                Array.from({ length: 6 }).map((_, i) => <OfferSkeletonCard key={i} />)
              ) : offersData?.data.length === 0 ? (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gold/20">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <Badge className="bg-gold/20 text-gold border-none mb-4 px-4 py-1.5 font-semibold uppercase tracking-wider text-xs">
                    Coming Soon
                  </Badge>
                  <h3 className="text-2xl font-bold text-primary mb-3">Brand Deals Coming Soon</h3>
                  <p className="text-secondary max-w-md mx-auto leading-relaxed">
                    We're partnering with the best local brands, cafés, boutiques, and adventure stores in Manali. Exclusive hotel guest offers will appear here soon.
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {offersData?.data.map((offer) => (
                    <motion.div
                      key={offer.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col relative group"
                    >
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-100 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                      <div className="absolute top-4 right-4 text-gold bg-white shadow-sm p-2 rounded-full">
                        <Gift className="w-5 h-5" />
                      </div>

                      <div className="p-6 pb-0 pt-8 flex-1">
                        <Badge className="bg-gold/20 text-gold border-none mb-4 px-3 py-1 font-semibold uppercase tracking-wider text-[10px]">
                          {offer.offer_type}
                        </Badge>
                        <h3 className="text-xl font-bold text-primary mb-2 leading-tight">
                          {offer.title}
                        </h3>
                        <p className="text-secondary text-sm mb-4 line-clamp-3 leading-relaxed">
                          {offer.description}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-4 text-sm font-medium text-slate-700 bg-surface p-3 rounded-xl border border-slate-100">
                          <ShoppingBag className="w-4 h-4 text-gold" />
                          <span className="line-clamp-1">{offer.shop_name || offer.brand_name}</span>
                        </div>
                      </div>

                      <div className="p-6 pt-4 mt-auto">
                        <Button 
                          onClick={() => handleClaimOffer(offer.id)}
                          disabled={generateCoupon.isPending}
                          className="w-full bg-gold hover:bg-[#b0923e] text-white rounded-xl h-12 shadow-lg shadow-violet-600/20 group-hover:shadow-violet-600/40 transition-all font-semibold flex items-center justify-center gap-2"
                        >
                          {generateCoupon.isPending ? 'Generating...' : (
                            <>
                              <Ticket className="w-5 h-5" />
                              Claim Coupon
                            </>
                          )}
                        </Button>
                        <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          Valid until {new Date(offer.expiry_date).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function OfferSkeletonCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-[400px]">
      <div className="p-6 flex-1 flex flex-col gap-4 pt-8">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-2/3" />
        <div className="space-y-2 mt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
      <div className="p-6 pt-0 mt-auto">
        <Skeleton className="h-12 w-full rounded-xl mb-3" />
        <Skeleton className="h-3 w-1/2 mx-auto" />
      </div>
    </div>
  );
}
