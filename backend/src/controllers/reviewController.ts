import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatuses';
import { supabase } from '../config/supabase';

export const getReviews = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, title, comment, stay_type, room_type, country, avatar_url, guest_name, created_at, users(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedData = data.map((r: any) => ({
      id: r.id,
      guestName: r.guest_name || r.users?.name || 'Anonymous Guest',
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      stayType: r.stay_type,
      roomType: r.room_type,
      country: r.country,
      avatarUrl: r.avatar_url,
      date: new Date(r.created_at).toISOString().split('T')[0]
    }));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Reviews fetched successfully',
      data: formattedData
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to fetch reviews' });
  }
};

export const createReview = async (_req: Request, res: Response): Promise<void> => {
  try {
    // const { guestName, rating, comment } = req.body;
    // NOTE: This currently lacks authentication. 
    // We would need to associate the review with a logged-in user in Milestone 5.
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Review creation deferred until Auth milestone',
      data: null
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to create review' });
  }
};
