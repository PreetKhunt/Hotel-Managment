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
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Hotel Settings</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Hotel Name</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md" 
              value={settings?.hotel_name || ''} 
              onChange={e => setSettings({...settings, hotel_name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Currency</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md" 
              value={settings?.currency || ''} 
              onChange={e => setSettings({...settings, currency: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Contact Email</label>
            <input 
              type="email" 
              className="w-full p-2 border rounded-md" 
              value={settings?.support_email || ''} 
              onChange={e => setSettings({...settings, support_email: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Contact Phone</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md" 
              value={settings?.support_phone || ''} 
              onChange={e => setSettings({...settings, support_phone: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tax Percentage (GST)</label>
            <input 
              type="number" 
              className="w-full p-2 border rounded-md" 
              value={settings?.gst_percentage || 0} 
              onChange={e => setSettings({...settings, gst_percentage: parseFloat(e.target.value) || 0})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Logo URL</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md" 
              value={settings?.logo_url || ''} 
              onChange={e => setSettings({...settings, logo_url: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Check-In Time</label>
            <input 
              type="time" 
              className="w-full p-2 border rounded-md" 
              value={settings?.check_in_time || '14:00'} 
              onChange={e => setSettings({...settings, check_in_time: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Check-Out Time</label>
            <input 
              type="time" 
              className="w-full p-2 border rounded-md" 
              value={settings?.check_out_time || '11:00'} 
              onChange={e => setSettings({...settings, check_out_time: e.target.value})}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Physical Address</label>
          <textarea 
            className="w-full p-2 border rounded-md h-20" 
            value={settings?.address || ''} 
            onChange={e => setSettings({...settings, address: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Hotel Description</label>
          <textarea 
            className="w-full p-2 border rounded-md h-32" 
            value={settings?.description || ''} 
            onChange={e => setSettings({...settings, description: e.target.value})}
          />
        </div>
      </div>
    </div>
  );
}
