"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Save, Loader2, Settings, Mail, MapPin, Globe, Building2, Percent, Clock, DollarSign, FileText, Image } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

// ─── Color Palette ────────────────────────────────────────────────────────────
const GOLD = '#C9A84C';
const CARD_BG = '#1A2235';
const TEXT = '#F8FAFC';
const SECONDARY = '#94A3B8';

interface HotelSettingsDTO {
  hotel_name: string;
  logo_url: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  currency: string;
  timezone: string;
  check_in_time: string;
  check_out_time: string;
  gst_percentage: number;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<HotelSettingsDTO>>({
    hotel_name: "",
    logo_url: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    currency: "USD",
    timezone: "UTC",
    check_in_time: "14:00",
    check_out_time: "11:00",
    gst_percentage: 18,
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["hotel-settings"],
    queryFn: async () => {
      const res = await api.get("/hotels/settings");
      return res.data.data;
    }
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        hotel_name: settings.hotelName || settings.hotel_name || "Hospitality Hub Default Hotel",
        logo_url: settings.logoUrl || settings.logo_url || "",
        email: settings.email || settings.supportEmail || settings.support_email || "",
        phone: settings.phone || settings.supportPhone || settings.support_phone || "",
        address: settings.address || "",
        description: settings.description || "",
        currency: settings.currency || "USD",
        timezone: settings.timezone || "UTC",
        check_in_time: (settings.checkInTime || settings.check_in_time || "14:00").toString().slice(0, 5),
        check_out_time: (settings.checkOutTime || settings.check_out_time || "11:00").toString().slice(0, 5),
        gst_percentage: settings.gstPercentage !== undefined ? Number(settings.gstPercentage) : (settings.gst_percentage !== undefined ? Number(settings.gst_percentage) : 18),
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (updatedData: Partial<HotelSettingsDTO>) => {
      const payload = {
        hotel_name: updatedData.hotel_name,
        hotelName: updatedData.hotel_name,
        logo_url: updatedData.logo_url,
        logoUrl: updatedData.logo_url,
        email: updatedData.email,
        support_email: updatedData.email,
        supportEmail: updatedData.email,
        phone: updatedData.phone,
        support_phone: updatedData.phone,
        supportPhone: updatedData.phone,
        address: updatedData.address,
        description: updatedData.description,
        currency: updatedData.currency,
        timezone: updatedData.timezone,
        check_in_time: updatedData.check_in_time,
        checkInTime: updatedData.check_in_time,
        check_out_time: updatedData.check_out_time,
        checkOutTime: updatedData.check_out_time,
        gst_percentage: Number(updatedData.gst_percentage || 0),
        gstPercentage: Number(updatedData.gst_percentage || 0),
      };
      const res = await api.put("/hotels/settings", payload);
      return res.data;
    },
    onSuccess: (data) => {
      if (data && (data.success || data.data)) {
        toast.success("Hotel settings synchronized with PostgreSQL database!");
        queryClient.invalidateQueries({ queryKey: ["hotel-settings"] });
      } else {
        toast.error(data?.message || "Failed to update hotel settings");
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Error updating settings in database");
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-9 h-9 animate-spin" style={{ color: GOLD }} />
      </div>
    );
  }

  const inputStyle = {
    width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px',
    background: '#0F1626', border: '1px solid rgba(255,255,255,0.12)',
    color: TEXT, fontSize: '0.88rem', outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = { display: 'block', marginBottom: '0.45rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600 };

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-playfair flex items-center gap-2" style={{ color: '#ffffff' }}>
            <Settings className="w-6 h-6" style={{ color: GOLD }} />
            Hotel ERP Settings & Configuration
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', marginTop: '4px' }}>
            Synchronize property metadata, tax structures, and operational parameters directly with PostgreSQL.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* General Property Information */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl border" style={{ background: CARD_BG, borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5 mb-5 border-b pb-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <Building2 className="w-5 h-5" style={{ color: GOLD }} />
            <h3 className="text-lg font-bold" style={{ color: '#ffffff' }}>
              Property Identity
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label style={labelStyle}>Hotel Name</label>
              <input type="text" name="hotel_name" value={formData.hotel_name || ''} onChange={handleChange} style={inputStyle} placeholder="Hospitality Hub Grand" required />
            </div>
            <div>
              <label style={labelStyle}>
                <Image size={14} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
                Logo URL
              </label>
              <input type="text" name="logo_url" value={formData.logo_url || ''} onChange={handleChange} style={inputStyle} placeholder="https://cdn.hospitalityhub.com/logo.png" />
            </div>
            <div className="md:col-span-2">
              <label style={labelStyle}>
                <FileText size={14} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
                Property Description & Tagline
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description || ''}
                onChange={handleChange}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Experience luxury hospitality with integrated IoT climate control and bespoke concierge services."
              />
            </div>
          </div>
        </motion.div>

        {/* Contact Information & Address */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl border" style={{ background: CARD_BG, borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5 mb-5 border-b pb-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <MapPin className="w-5 h-5" style={{ color: GOLD }} />
            <h3 className="text-lg font-bold" style={{ color: '#ffffff' }}>
              Contact & Location details
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label style={labelStyle}>
                <Mail size={14} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
                Support / Reservation Email
              </label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} style={inputStyle} placeholder="reservations@hospitalityhub.com" />
            </div>
            <div>
              <label style={labelStyle}>Contact Telephone</label>
              <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} style={inputStyle} placeholder="+1 (800) 555-HOTEL" />
            </div>
            <div className="md:col-span-2">
              <label style={labelStyle}>Full Physical Address & Location</label>
              <input type="text" name="address" value={formData.address || ''} onChange={handleChange} style={inputStyle} placeholder="742 Evergreen Terrace, Suite 100, Metropolis, USA" />
            </div>
          </div>
        </motion.div>

        {/* Financials & Taxes */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="p-6 rounded-2xl border" style={{ background: CARD_BG, borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5 mb-5 border-b pb-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <DollarSign className="w-5 h-5" style={{ color: GOLD }} />
            <h3 className="text-lg font-bold" style={{ color: '#ffffff' }}>
              Financials & Taxation
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label style={labelStyle}>Base Operating Currency</label>
              <select name="currency" value={formData.currency || 'USD'} onChange={handleChange} style={inputStyle}>
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="CAD">CAD ($ - Canadian Dollar)</option>
                <option value="AUD">AUD ($ - Australian Dollar)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>
                <Percent size={14} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
                Applicable GST / Tax Rate (%)
              </label>
              <input type="number" step="0.01" min="0" max="100" name="gst_percentage" value={formData.gst_percentage !== undefined ? formData.gst_percentage : 18} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
        </motion.div>

        {/* Operational Information */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl border" style={{ background: CARD_BG, borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5 mb-5 border-b pb-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <Clock className="w-5 h-5" style={{ color: GOLD }} />
            <h3 className="text-lg font-bold" style={{ color: '#ffffff' }}>
              Operational Schedules & Timings
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label style={labelStyle}>Property Timezone</label>
              <input type="text" name="timezone" value={formData.timezone || 'UTC'} onChange={handleChange} style={inputStyle} placeholder="e.g. America/New_York or UTC" />
            </div>
            <div>
              <label style={labelStyle}>Standard Check-in Time</label>
              <input type="time" name="check_in_time" value={formData.check_in_time || '14:00'} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Standard Check-out Time</label>
              <input type="time" name="check_out_time" value={formData.check_out_time || '11:00'} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
        </motion.div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #a8863c)', color: '#0A0F1E', fontSize: '0.95rem' }}
          >
            {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Synchronize Settings with DB
          </button>
        </div>
      </form>
    </div>
  );
}

