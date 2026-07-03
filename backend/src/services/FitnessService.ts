import { IFitnessRepository, CreateFitnessBookingDTO, FitnessBooking } from '../domain/repositories/IFitnessRepository';
import { AppError, ErrorCode } from '../utils/AppError';

export class FitnessService {
  constructor(private readonly fitnessRepo: IFitnessRepository) {}

  async createBooking(data: CreateFitnessBookingDTO): Promise<FitnessBooking> {
    // Business logic: check date validity, etc.
    const bookingDate = new Date(`${data.booking_date}T${data.booking_time}`);
    if (bookingDate < new Date()) {
      throw new AppError('Cannot book in the past', 400, ErrorCode.VALIDATION_ERROR);
    }
    return await this.fitnessRepo.create(data);
  }

  async getMyBookings(userId: string): Promise<FitnessBooking[]> {
    return await this.fitnessRepo.findByUserId(userId);
  }

  async getAllBookings(): Promise<FitnessBooking[]> {
    return await this.fitnessRepo.findAll();
  }

  async updateBookingStatus(id: string, status: string): Promise<FitnessBooking> {
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400, ErrorCode.VALIDATION_ERROR);
    }
    
    const booking = await this.fitnessRepo.findById(id);
    if (!booking) {
      throw new AppError('Booking not found', 404, ErrorCode.NOT_FOUND);
    }

    return await this.fitnessRepo.updateStatus(id, status);
  }

  async deleteBooking(id: string): Promise<void> {
    const booking = await this.fitnessRepo.findById(id);
    if (!booking) {
      throw new AppError('Booking not found', 404, ErrorCode.NOT_FOUND);
    }
    await this.fitnessRepo.delete(id);
  }
}
