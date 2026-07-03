"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Save, Loader2, Settings, Mail, MapPin, Globe } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

// ─── Color Palette ────────────────────────────────────────────────────────────
const GOLD = '#C9A84C';
const CARD_BG = '#1A2235';
const TEXT = '#F8FAFC';
const SECONDARY = '#94A3B8';

interface HotelSettings {
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  country: string;
  currency: string;
  timezone: string;
  check_in_time: string;
  check_out_time: string;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<HotelSettings>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ["hotel-settings"],
    queryFn: async () => {
      const res = await api.get("/hotels/settings");
      return res.data.data;
    }
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (updatedData: Partial<HotelSettings>) => {
      const res = await api.put("/hotels/settings", updatedData);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Settings updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["hotel-settings"] });
      } else {
        toast.error(data.message || "Failed to update settings");
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Error updating settings");
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: GOLD }} />
      </div>
    );
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: TEXT, fontSize: '14px', outline: 'none'
  };

  const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '13px', color: SECONDARY, fontWeight: 600 };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-playfair flex items-center gap-2">
            <Settings className="w-6 h-6" style={{ color: GOLD }} />
            Hotel Settings
          </h2>
          <p style={{ color: SECONDARY, fontSize: '14px', marginTop: '4px' }}>
            Manage core hotel configuration and operational parameters.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl border" style={{ background: CARD_BG, borderColor: 'rgba(255,255,255,0.05)' }}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: GOLD }}>
            <Mail className="w-5 h-5" /> Contact Information
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label style={labelStyle}>Contact Email</label>
              <input type="email" name="contact_email" value={formData.contact_email || ''} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Contact Phone</label>
              <input type="text" name="contact_phone" value={formData.contact_phone || ''} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
        </motion.div>

        {/* Location Information */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl border" style={{ background: CARD_BG, borderColor: 'rgba(255,255,255,0.05)' }}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: GOLD }}>
            <MapPin className="w-5 h-5" /> Location Details
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label style={labelStyle}>Street Address</label>
              <input type="text" name="address" value={formData.address || ''} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>City</label>
              <input type="text" name="city" value={formData.city || ''} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Country</label>
              <input type="text" name="country" value={formData.country || ''} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
        </motion.div>

        {/* Operational Information */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl border" style={{ background: CARD_BG, borderColor: 'rgba(255,255,255,0.05)' }}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: GOLD }}>
            <Globe className="w-5 h-5" /> Operational Settings
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label style={labelStyle}>Default Currency</label>
              <select name="currency" value={formData.currency || 'USD'} onChange={handleChange} style={inputStyle}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Timezone</label>
              <input type="text" name="timezone" value={formData.timezone || ''} onChange={handleChange} style={inputStyle} placeholder="e.g. UTC" />
            </div>
            <div>
              <label style={labelStyle}>Standard Check-in Time</label>
              <input type="time" name="check_in_time" value={formData.check_in_time || '15:00'} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Standard Check-out Time</label>
              <input type="time" name="check_out_time" value={formData.check_out_time || '11:00'} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
        </motion.div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 hover:opacity-90"
            style={{ background: GOLD, color: '#0A0F1E' }}
          >
            {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
