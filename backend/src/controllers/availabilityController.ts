import { Request, Response } from 'express';
import { availabilityService } from '../services/AvailabilityService';
import { sendSuccess, sendError } from '../middleware/apiResponse';
import { z } from 'zod';

const calendarQuerySchema = z.object({
  roomId: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const getCalendar = async (req: Request, res: Response) => {
  try {
    const validatedData = calendarQuerySchema.parse(req.query);

    const calendar = await availabilityService.getRoomCalendar(
      validatedData.roomId,
      validatedData.startDate,
      validatedData.endDate
    );

    return sendSuccess(res, calendar, 'Room calendar retrieved successfully');
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation Error', 400, error.errors);
    }
    return sendError(res, error.message, 500);
  }
};
