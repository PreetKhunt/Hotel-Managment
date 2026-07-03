import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatuses';
import { supabase } from '../config/supabase';

const mapRoom = (r: any) => ({
  id: r.id,
  name: r.name,
  type: r.type,
  status: r.status,
  pricePerNight: Number(r.price_per_night),
  size: r.size,
  maxGuests: r.capacity,
  bedType: r.bed_type,
  floor: r.floor,
  description: r.description,
  longDescription: r.long_description,
  amenities: r.amenities,
  images: r.images,
  rating: Number(r.rating),
  reviewCount: r.review_count,
  featured: r.featured
});

export const getRooms = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase.from('rooms').select('*').order('created_at', { ascending: false });

    if (error) throw error;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Rooms fetched from Supabase',
      data: data.map(mapRoom)
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to fetch rooms' });
  }
};

export const getRoomById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('rooms').select('*').eq('id', id).single();

    if (error) throw error;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Room fetched from Supabase',
      data: mapRoom(data)
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to fetch room' });
  }
};

export const createRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, pricePerNight, capacity, description } = req.body;

    const { data, error } = await supabase
      .from('rooms')
      .insert([
        { name, type, price_per_night: pricePerNight, capacity, description, status: 'available' }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Room created in Supabase',
      data
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to create room' });
  }
};

export const updateRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, type, pricePerNight, capacity, description, status } = req.body;

    const { data, error } = await supabase
      .from('rooms')
      .update({ name, type, price_per_night: pricePerNight, capacity, description, status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Room with ID ${id} updated in Supabase`,
      data
    });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to update room' });
  }
};

export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('rooms').delete().eq('id', id);

    if (error) throw error;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Room with ID ${id} deleted from Supabase`
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to delete room' });
  }
};
