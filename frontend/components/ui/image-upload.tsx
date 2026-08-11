import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
}

export function ImageUpload({ value, onChange, folder = 'general', placeholder = 'Image URL' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Enforce reasonable file size limit (5 MB) to prevent timeouts
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5 MB');
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('bucket', 'hotel-gallery');

      // api.ts has baseURL='/api/v1', so this resolves to POST /api/v1/upload.
      // Next.js rewrites /api/v1/* → Render backend /api/v1/*.
      // withCredentials:true (set in api.ts) sends hh_session cookie automatically.
      // Do NOT set Content-Type manually — Axios/browser sets the correct
      // multipart/form-data boundary automatically when given a FormData body.
      const response = await api.post('/upload', formData);

      const url = response.data?.data?.url;
      if (!url) {
        throw new Error('Upload succeeded but no URL was returned');
      }

      onChange(url);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to upload image';
      toast.error(message);
    } finally {
      setIsUploading(false);
      // Reset file input so the same file can be re-selected if needed
      e.target.value = '';
    }
  };

  return (
    <div className="flex gap-2 items-center w-full">
      <Input
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1"
      />
      <div className="relative">
        <Input
          type="file"
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          onChange={handleUpload}
          disabled={isUploading}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={isUploading}
          className="whitespace-nowrap flex items-center gap-2"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange('')}
          className="text-slate-400 hover:text-red-600"
          title="Remove Image"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
