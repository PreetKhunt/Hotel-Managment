import { SupabaseClient } from '@supabase/supabase-js';
import { IFitnessRepository, FitnessBooking, CreateFitnessBookingDTO } from '../IFitnessRepository';

export class FitnessRepository implements IFitnessRepository {
  constructor(private supabase: SupabaseClient) {}

  async create(booking: CreateFitnessBookingDTO): Promise<FitnessBooking> {
    const { data, error } = await this.supabase
      .from('fitness_bookings')
      .insert([booking])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findById(id: string): Promise<FitnessBooking | null> {
    const { data, error } = await this.supabase
      .from('fitness_bookings')
      .select('*, users(name, email)')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
  }

  async findByUserId(userId: string): Promise<FitnessBooking[]> {
    const { data, error } = await this.supabase
      .from('fitness_bookings')
      .select('*')
      .eq('user_id', userId)
      .order('booking_date', { ascending: false })
      .order('booking_time', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async findAll(): Promise<FitnessBooking[]> {
    const { data, error } = await this.supabase
      .from('fitness_bookings')
      .select('*, users(name, email)')
      .order('booking_date', { ascending: false })
      .order('booking_time', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async updateStatus(id: string, status: string): Promise<FitnessBooking> {
    const { data, error } = await this.supabase
      .from('fitness_bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('fitness_bookings')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}
