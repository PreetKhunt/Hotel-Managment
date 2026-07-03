import { Request, Response, NextFunction } from 'express';
import { FitnessService } from '../services/FitnessService';
import { AppError, ErrorCode } from '../utils/AppError';
import { z } from 'zod';

const createBookingSchema = z.object({
  booking_type: z.string().min(1, 'Booking type is required'),
  trainer_name: z.string().optional(),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  booking_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
  duration: z.number().int().positive().optional(),
  special_requests: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
});

export class FitnessController {
  constructor(private readonly fitnessService: FitnessService) {}

  public bookFitness = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user_id = req.user?.id;
      if (!user_id) throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);

      const parsedData = createBookingSchema.parse(req.body);

      const booking = await this.fitnessService.createBooking({
        user_id,
        ...parsedData
      });

      res.status(201).json({
        success: true,
        message: 'Fitness booking created successfully',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  };

  public getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user_id = req.user?.id;
      if (!user_id) throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);

      const bookings = await this.fitnessService.getMyBookings(user_id);

      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  };

  public getAllBookings = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const bookings = await this.fitnessService.getAllBookings();

      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const parsedData = updateStatusSchema.parse(req.body);

      const booking = await this.fitnessService.updateBookingStatus(id, parsedData.status);

      res.status(200).json({
        success: true,
        message: 'Booking status updated',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.fitnessService.deleteBooking(id);

      res.status(200).json({
        success: true,
        message: 'Booking deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
