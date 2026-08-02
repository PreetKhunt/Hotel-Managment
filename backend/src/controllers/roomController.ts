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

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Room not found' });
        return;
      }
      throw error;
    }
    
    if (!data) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Room not found' });
      return;
    }

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
    const price = req.body.pricePerNight !== undefined ? req.body.pricePerNight : (req.body.price_per_night || 250);
    const maxCapacity = req.body.maxGuests !== undefined ? req.body.maxGuests : (req.body.capacity || 2);
    const bed = req.body.bedType !== undefined ? req.body.bedType : (req.body.bed_type || 'Queen Bed');
    const longDesc = req.body.longDescription !== undefined ? req.body.longDescription : (req.body.long_description || req.body.description || '');

    const { data, error } = await supabase
      .from('rooms')
      .insert([{
        name: req.body.name,
        type: req.body.type || 'standard',
        price_per_night: Number(price),
        capacity: Number(maxCapacity),
        size: Number(req.body.size || 350),
        bed_type: bed,
        floor: Number(req.body.floor || 1),
        description: req.body.description || '',
        long_description: longDesc,
        amenities: req.body.amenities || ['Free Wi-Fi', 'Room Service', 'Flat Screen TV'],
        images: req.body.images || ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200'],
        status: req.body.status || 'available',
        rating: Number(req.body.rating || 5.0),
        review_count: Number(req.body.reviewCount || req.body.review_count || 0),
        featured: Boolean(req.body.featured || false)
      }])
      .select()
      .single();

    if (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
      return;
    }

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Room created in Supabase',
      data: mapRoom(data)
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to create room' });
  }
};

export const updateRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatePayload: Record<string, any> = {};
    if (req.body.name !== undefined) updatePayload.name = req.body.name;
    if (req.body.type !== undefined) updatePayload.type = req.body.type;
    if (req.body.status !== undefined) updatePayload.status = req.body.status;
    if (req.body.pricePerNight !== undefined) updatePayload.price_per_night = Number(req.body.pricePerNight);
    else if (req.body.price_per_night !== undefined) updatePayload.price_per_night = Number(req.body.price_per_night);
    if (req.body.maxGuests !== undefined) updatePayload.capacity = Number(req.body.maxGuests);
    else if (req.body.capacity !== undefined) updatePayload.capacity = Number(req.body.capacity);
    if (req.body.size !== undefined) updatePayload.size = Number(req.body.size);
    if (req.body.bedType !== undefined) updatePayload.bed_type = req.body.bedType;
    else if (req.body.bed_type !== undefined) updatePayload.bed_type = req.body.bed_type;
    if (req.body.floor !== undefined) updatePayload.floor = Number(req.body.floor);
    if (req.body.description !== undefined) updatePayload.description = req.body.description;
    if (req.body.longDescription !== undefined) updatePayload.long_description = req.body.longDescription;
    else if (req.body.long_description !== undefined) updatePayload.long_description = req.body.long_description;
    if (req.body.amenities !== undefined) updatePayload.amenities = req.body.amenities;
    if (req.body.images !== undefined) updatePayload.images = req.body.images;
    if (req.body.featured !== undefined) updatePayload.featured = Boolean(req.body.featured);

    const { data, error } = await supabase
      .from('rooms')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Room with ID ${id} updated in Supabase`,
      data: mapRoom(data)
    });
  } catch (error) {
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
