import { useQuery } from '@tanstack/react-query';
import { Testimonial } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export function useReviews() {
  return useQuery({
    queryKey: ['reviews'],
    queryFn: async (): Promise<Testimonial[]> => {
      const response = await fetch(`${API_BASE_URL}/reviews`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
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
