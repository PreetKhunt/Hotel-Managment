'use client';

import React, { useState } from 'react';
import { usePlaces, useCreatePlace, useDeletePlace } from '@/hooks/useManali';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/ui/image-upload';
import { MapPin, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminExploreManaliPage() {
  const { data: places, isLoading } = usePlaces();
  const createPlace = useCreatePlace();
  const deletePlace = useDeletePlace();
  

  const [newPlace, setNewPlace] = useState({ name: '', category: '', description: '', distance_from_hotel: 0, image: '' });
  const [isAdding, setIsAdding] = useState(false);

  const handleCreate = async () => {
    try {
      await createPlace.mutateAsync(newPlace);
      toast.success('Place created successfully');
      setIsAdding(false);
      setNewPlace({ name: '', category: '', description: '', distance_from_hotel: 0, image: '' });
    } catch (e: any) {
      toast.error(e.message || 'Error creating place');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this place?')) {
      try {
        await deletePlace.mutateAsync(id);
        toast.success('Place deleted successfully');
      } catch (e: any) {
        toast.error(e.message || 'Error deleting');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            Manage Explore Manali
          </h1>
          <p className="text-slate-500">Add, edit, and manage places, activities, and local guides.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New Place
        </Button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Name" value={newPlace.name} onChange={e => setNewPlace({...newPlace, name: e.target.value})} />
          <Input placeholder="Category" value={newPlace.category} onChange={e => setNewPlace({...newPlace, category: e.target.value})} />
          <Input placeholder="Description" value={newPlace.description} onChange={e => setNewPlace({...newPlace, description: e.target.value})} className="md:col-span-2" />
          <Input type="number" placeholder="Distance (km)" value={newPlace.distance_from_hotel || ''} onChange={e => setNewPlace({...newPlace, distance_from_hotel: Number(e.target.value)})} />
          <ImageUpload 
            value={newPlace.image || ''} 
            onChange={url => setNewPlace({...newPlace, image: url})} 
            folder="explore-manali"
          />
          <div className="md:col-span-2 flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createPlace.isPending}>
              {createPlace.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Place
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-4 font-medium">Place Name</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Distance</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
            ) : places?.data.map((place) => (
              <tr key={place.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-slate-800">{place.name}</td>
                <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">{place.category}</span></td>
                <td className="p-4 text-slate-500">{place.distance_from_hotel} km</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(place.id)} className="h-8 w-8 text-slate-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {places?.data.length === 0 && !isLoading && (
              <tr><td colSpan={4} className="p-8 text-center text-slate-500">No places found. Add one to get started!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
