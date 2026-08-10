import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError, ErrorCode } from '../utils/AppError';

export const reserveTable = async (req: Request, res: Response) => {
  const { date, time, guests, special_requests } = req.body;
  const user_id = req.user?.id;

  if (!user_id) throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
  if (!date || !time || !guests) throw new AppError('Missing required fields', 400, ErrorCode.VALIDATION_ERROR);

  const { data, error } = await supabase
    .from('restaurant_reservations')
    .insert([{ user_id, date, time, guests, special_requests }])
    .select()
    .single();

  if (error) throw new AppError(error.message, 500, ErrorCode.INTERNAL_SERVER_ERROR);

  res.status(201).json({
    success: true,
    message: 'Table reserved successfully',
    data,
  });
};

export const getMyReservations = async (req: Request, res: Response) => {
  const user_id = req.user?.id;
  if (!user_id) throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);

  const { data, error } = await supabase
    .from('restaurant_reservations')
    .select('*')
    .eq('user_id', user_id)
    .order('date', { ascending: false });

  if (error) throw new AppError(error.message, 500, ErrorCode.INTERNAL_SERVER_ERROR);

  res.status(200).json({
    success: true,
    data,
  });
};

export const getAllReservations = async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('restaurant_reservations')
    .select('*, users(name, email)')
    .order('date', { ascending: false });

  if (error) throw new AppError(error.message, 500, ErrorCode.INTERNAL_SERVER_ERROR);

  res.status(200).json({
    success: true,
    data,
  });
};

export const cancelRestaurantReservation = async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: existingReservation, error: fetchError } = await supabase
    .from('restaurant_reservations')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existingReservation) {
    throw new AppError('Dining reservation not found', 404, ErrorCode.NOT_FOUND);
  }

  if (existingReservation.status === 'cancelled') {
    throw new AppError('Dining reservation is already cancelled', 400, ErrorCode.VALIDATION_ERROR);
  }

  if (existingReservation.status === 'completed') {
    throw new AppError('Completed dining reservations cannot be cancelled', 400, ErrorCode.VALIDATION_ERROR);
  }

  const { data, error } = await supabase
    .from('restaurant_reservations')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 500, ErrorCode.INTERNAL_SERVER_ERROR);
  }

  res.status(200).json({
    success: true,
    message: 'Dining reservation cancelled successfully',
    data,
  });
};
