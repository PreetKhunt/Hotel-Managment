'use client';

import React, { useState } from 'react';
import { useShops, useCreateShop, useDeleteShop, useOffers, useCreateOffer, useDeleteOffer, useRedeemCoupon } from '@/hooks/useShopping';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingBag, Plus, Trash2, Edit2, Loader2, Tag, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminShoppingDealsPage() {
  const { data: shops, isLoading: loadingShops } = useShops();
  const createShop = useCreateShop();
  const deleteShop = useDeleteShop();
  
  const { data: offers, isLoading: loadingOffers } = useOffers();
  const createOffer = useCreateOffer();
  const deleteOffer = useDeleteOffer();
  
  const redeemCoupon = useRedeemCoupon();

  const [activeTab, setActiveTab] = useState('shops');
  
  const [newShop, setNewShop] = useState({ shop_name: '', brand_name: '', category: '', address: '' });
  const [newOffer, setNewOffer] = useState({ shop_id: '', title: '', description: '', offer_type: '', discount_value: 0, expiry_date: '', max_redemptions: 0 });
  const [couponCode, setCouponCode] = useState('');
  
  const [isAdding, setIsAdding] = useState(false);

  const handleCreateShop = async () => {
    try {
      await createShop.mutateAsync(newShop);
      toast.success('Shop created successfully' );
      setIsAdding(false);
      setNewShop({ shop_name: '', brand_name: '', category: '', address: '' });
    } catch (e: any) {
      toast.error(e.message || 'Error creating shop');
    }
  };

  const handleDeleteShop = async (id: string) => {
    if (confirm('Are you sure you want to delete this shop?')) {
      try {
        await deleteShop.mutateAsync(id);
        toast.success('Shop deleted successfully');
      } catch (e: any) {
        toast.error(e.message || 'Error deleting');
      }
    }
  };

  const handleCreateOffer = async () => {
    try {
      // Basic validation
      if (!newOffer.shop_id || !newOffer.expiry_date) {
        toast.error('Please fill all required fields.');
        return;
      }
      await createOffer.mutateAsync({
        ...newOffer,
        expiry_date: new Date(newOffer.expiry_date).toISOString()
      });
      toast.success('Offer created successfully' );
      setIsAdding(false);
      setNewOffer({ shop_id: '', title: '', description: '', offer_type: '', discount_value: 0, expiry_date: '', max_redemptions: 0 });
    } catch (e: any) {
      toast.error(e.message || 'Error creating offer');
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      try {
        await deleteOffer.mutateAsync(id);
        toast.success('Offer deleted successfully');
      } catch (e: any) {
        toast.error(e.message || 'Error deleting');
      }
    }
  };

  const handleRedeem = async () => {
    if (!couponCode) return;
    try {
      await redeemCoupon.mutateAsync(couponCode);
      toast.success('Coupon redeemed successfully');
      setCouponCode('');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Error redeeming coupon');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-gold" />
            Manage Shopping Deals
          </h1>
          <p className="text-slate-400">Manage partner shops and exclusive hotel guest offers.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'shops' ? 'default' : 'outline'} 
            onClick={() => { setActiveTab('shops'); setIsAdding(false); }}
            className={activeTab === 'shops' ? 'bg-gold text-[#0A0F1E] hover:bg-[#b0923e]' : ''}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Shops
          </Button>
          <Button 
            variant={activeTab === 'offers' ? 'default' : 'outline'} 
            onClick={() => { setActiveTab('offers'); setIsAdding(false); }}
            className={activeTab === 'offers' ? 'bg-gold text-[#0A0F1E] hover:bg-[#b0923e]' : ''}
          >
            <Tag className="w-4 h-4 mr-2" />
            Offers
          </Button>
          <Button 
            variant={activeTab === 'redeem' ? 'default' : 'outline'} 
            onClick={() => { setActiveTab('redeem'); setIsAdding(false); }}
            className={activeTab === 'redeem' ? 'bg-gold text-[#0A0F1E] hover:bg-[#b0923e]' : ''}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Redeem
          </Button>
        </div>
      </div>

      {activeTab !== 'redeem' && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsAdding(!isAdding)} className="bg-gold text-[#0A0F1E] hover:bg-[#b0923e]">
            <Plus className="w-4 h-4 mr-2" />
            {activeTab === 'shops' ? 'Add New Shop' : 'Add New Offer'}
          </Button>
        </div>
      )}

      {isAdding && activeTab === 'shops' && (
        <div className="bg-surface-card p-6 rounded-2xl border border-[rgba(255,255,255,0.07)] shadow-sm mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input className="luxury-input" placeholder="Shop Name *" value={newShop.shop_name} onChange={e => setNewShop({...newShop, shop_name: e.target.value})} />
          <Input className="luxury-input" placeholder="Brand Name" value={newShop.brand_name} onChange={e => setNewShop({...newShop, brand_name: e.target.value})} />
          <Input className="luxury-input" placeholder="Category *" value={newShop.category} onChange={e => setNewShop({...newShop, category: e.target.value})} />
          <Input className="luxury-input" placeholder="Address *" value={newShop.address} onChange={e => setNewShop({...newShop, address: e.target.value})} />
          <div className="md:col-span-2 flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button onClick={handleCreateShop} disabled={createShop.isPending} className="bg-gold text-[#0A0F1E] hover:bg-[#b0923e]">
              {createShop.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Shop
            </Button>
          </div>
        </div>
      )}

      {isAdding && activeTab === 'offers' && (
        <div className="bg-surface-card p-6 rounded-2xl border border-[rgba(255,255,255,0.07)] shadow-sm mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <select className="flex h-10 w-full items-center justify-between rounded-xl border border-gold/20 bg-surface text-sm text-slate-200 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50 px-3 py-2"
            value={newOffer.shop_id} 
            onChange={e => setNewOffer({...newOffer, shop_id: e.target.value})}
          >
            <option value="">Select Shop *</option>
            {shops?.data.map(shop => (
              <option key={shop.id} value={shop.id}>{shop.shop_name}</option>
            ))}
          </select>
          <Input className="luxury-input" placeholder="Offer Title *" value={newOffer.title} onChange={e => setNewOffer({...newOffer, title: e.target.value})} />
          <Input className="luxury-input md:col-span-2" placeholder="Description *" value={newOffer.description} onChange={e => setNewOffer({...newOffer, description: e.target.value})} />
          <Input className="luxury-input" placeholder="Offer Type (e.g., Flat Discount, Percentage) *" value={newOffer.offer_type} onChange={e => setNewOffer({...newOffer, offer_type: e.target.value})} />
          <Input className="luxury-input" type="number" placeholder="Discount Value *" value={newOffer.discount_value || ''} onChange={e => setNewOffer({...newOffer, discount_value: Number(e.target.value)})} />
          <Input className="luxury-input" type="date" placeholder="Expiry Date *" value={newOffer.expiry_date} onChange={e => setNewOffer({...newOffer, expiry_date: e.target.value})} />
          <Input className="luxury-input" type="number" placeholder="Max Redemptions (0 for unlimited)" value={newOffer.max_redemptions || ''} onChange={e => setNewOffer({...newOffer, max_redemptions: Number(e.target.value)})} />
          <div className="md:col-span-2 flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button onClick={handleCreateOffer} disabled={createOffer.isPending} className="bg-gold text-[#0A0F1E] hover:bg-[#b0923e]">
              {createOffer.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Offer
            </Button>
          </div>
        </div>
      )}

      {activeTab !== 'redeem' && (
        <div className="bg-surface-card rounded-2xl border border-[rgba(255,255,255,0.07)] shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-card text-slate-300">
              <tr>
                {activeTab === 'shops' ? (
                  <>
                    <th className="p-4 font-medium">Shop Name</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Address</th>
                  </>
                ) : (
                  <>
                    <th className="p-4 font-medium">Offer Title</th>
                    <th className="p-4 font-medium">Shop</th>
                    <th className="p-4 font-medium">Expiry</th>
                    <th className="p-4 font-medium">Redemptions</th>
                  </>
                )}
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {activeTab === 'shops' && (
                loadingShops ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                ) : shops?.data.map((shop) => (
                  <tr key={shop.id} className="hover:bg-[rgba(201,168,76,0.04)] transition-colors">
                    <td className="p-4 font-medium text-white">{shop.shop_name} {shop.brand_name && <span className="text-xs text-slate-400 block">{shop.brand_name}</span>}</td>
                    <td className="p-4"><span className="bg-[rgba(255,255,255,0.05)] text-slate-300 px-2 py-1 rounded text-xs">{shop.category}</span></td>
                    <td className="p-4 text-slate-400">{shop.address}</td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteShop(shop.id)} className="h-8 w-8 text-slate-400 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}

              {activeTab === 'offers' && (
                loadingOffers ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                ) : offers?.data.map((offer) => (
                  <tr key={offer.id} className="hover:bg-[rgba(201,168,76,0.04)] transition-colors">
                    <td className="p-4 font-medium text-white">{offer.title}</td>
                    <td className="p-4 text-slate-300">{offer.shop_name || offer.brand_name}</td>
                    <td className="p-4 text-slate-400">{new Date(offer.expiry_date).toLocaleDateString()}</td>
                    <td className="p-4 text-slate-400">{offer.current_redemptions} / {offer.max_redemptions || '∞'}</td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteOffer(offer.id)} className="h-8 w-8 text-slate-400 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
              
              {activeTab === 'shops' && shops?.data.length === 0 && !loadingShops && (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400">No partner shops found.</td></tr>
              )}
              {activeTab === 'offers' && offers?.data.length === 0 && !loadingOffers && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">No offers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'redeem' && (
        <div className="bg-surface-card p-6 rounded-2xl border border-[rgba(255,255,255,0.07)] shadow-sm max-w-lg mx-auto mt-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Redeem Coupon</h2>
          <p className="text-sm text-slate-400 mb-6">Enter the coupon code provided by the guest to validate and redeem it.</p>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g. SHOP-123456" 
              value={couponCode} 
              onChange={e => setCouponCode(e.target.value)} 
              className="flex-1 uppercase"
            />
            <Button 
              onClick={handleRedeem} 
              disabled={redeemCoupon.isPending || !couponCode}
              className="bg-gold text-[#0A0F1E] hover:bg-[#b0923e]"
            >
              {redeemCoupon.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Redeem
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
