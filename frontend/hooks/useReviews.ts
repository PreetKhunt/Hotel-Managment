import { useQuery } from '@tanstack/react-query';
import { Testimonial } from '@/types';
import api from '@/lib/api';

export function useReviews() {
  return useQuery({
    queryKey: ['reviews'],
    queryFn: async (): Promise<Testimonial[]> => {
      const response = await api.get('/reviews');
      const data = response.data;
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch reviews');
      }
      
      // Map to frontend Testimonial interface
      return data.data.map((r: any) => ({
        id: r.id,
        name: r.guestName,
        role: 'Verified Guest',
        avatar: r.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.guestName)}&background=random`,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        stayType: r.stayType,
        roomType: r.roomType,
        country: r.country,
        date: r.date
      }));
    },
  });
}
