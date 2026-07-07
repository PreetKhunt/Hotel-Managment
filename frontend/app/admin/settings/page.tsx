'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsManagement() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/super-admin/settings');
      console.log('Fetched settings:', data);
      setSettings(data.data || {});
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Filter out system fields to avoid DB update errors
      const { id, hotel_id, created_at, updated_at, ...updateData } = settings;
      
      await api.put('/super-admin/settings', updateData);
      toast.success('Settings saved successfully');
      // Reload settings to ensure we have the latest
      await fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8" /></div>;

  return (
    <div className="space-y-6 max-w-4xl text-slate-200">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Hotel Settings</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg shadow-lg p-6 space-y-6 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Hotel Name</label>
            <input 
              type="text" 
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={settings?.hotel_name || ''} 
              placeholder="e.g. Grand Plaza Hotel"
              onChange={e => setSettings({...settings, hotel_name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Currency</label>
            <input 
              type="text" 
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={settings?.currency || ''} 
              placeholder="e.g. USD"
              onChange={e => setSettings({...settings, currency: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Contact Email</label>
            <input 
              type="email" 
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={settings?.support_email || ''} 
              placeholder="e.g. contact@hotel.com"
              onChange={e => setSettings({...settings, support_email: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Contact Phone</label>
            <input 
              type="text" 
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={settings?.support_phone || ''} 
              placeholder="e.g. +1 234 567 890"
              onChange={e => setSettings({...settings, support_phone: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Tax Percentage (GST)</label>
            <input 
              type="number" 
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={settings?.gst_percentage || 0} 
              onChange={e => setSettings({...settings, gst_percentage: parseFloat(e.target.value) || 0})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Logo URL</label>
            <input 
              type="text" 
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={settings?.logo_url || ''} 
              placeholder="https://example.com/logo.png"
              onChange={e => setSettings({...settings, logo_url: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Check-In Time</label>
            <input 
              type="time" 
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={settings?.check_in_time || '14:00'} 
              onChange={e => setSettings({...settings, check_in_time: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Check-Out Time</label>
            <input 
              type="time" 
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={settings?.check_out_time || '11:00'} 
              onChange={e => setSettings({...settings, check_out_time: e.target.value})}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Physical Address</label>
          <textarea 
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 h-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={settings?.address || ''} 
            placeholder="123 Hotel Ave, City, Country"
            onChange={e => setSettings({...settings, address: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Hotel Description</label>
          <textarea 
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={settings?.description || ''} 
            placeholder="Describe your hotel..."
            onChange={e => setSettings({...settings, description: e.target.value})}
          />
        </div>
      </div>
    </div>
  );
}
