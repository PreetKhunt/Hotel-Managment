export interface FitnessBooking {
  id: string;
  user_id: string;
  booking_type: string;
  trainer_name?: string;
  booking_date: string;
  booking_time: string;
  duration: number;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at?: string;
  updated_at?: string;
  // relations
  users?: {
    name: string;
    email: string;
  };
}

export interface CreateFitnessBookingDTO {
  user_id: string;
  booking_type: string;
  trainer_name?: string;
  booking_date: string;
  booking_time: string;
  duration?: number;
  special_requests?: string;
}

export interface IFitnessRepository {
  create(booking: CreateFitnessBookingDTO): Promise<FitnessBooking>;
  findById(id: string): Promise<FitnessBooking | null>;
  findByUserId(userId: string): Promise<FitnessBooking[]>;
  findAll(): Promise<FitnessBooking[]>;
  updateStatus(id: string, status: string): Promise<FitnessBooking>;
  delete(id: string): Promise<void>;
}
