import { Request, Response, NextFunction } from 'express';
import { HotelService } from '../services/HotelService';
import { HTTP_STATUS } from '../constants/httpStatuses';

// We default to the single hotel ID for now
const DEFAULT_HOTEL_ID = '00000000-0000-0000-0000-000000000001';

export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hotelId = (req.query.hotelId as string) || DEFAULT_HOTEL_ID;
      const settings = await this.hotelService.getHotelSettings(hotelId);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hotelId = (req.body.hotelId as string) || DEFAULT_HOTEL_ID;
      const updatedSettings = await this.hotelService.updateHotelSettings(hotelId, req.body);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Settings updated successfully',
        data: updatedSettings,
      });
    } catch (error) {
      next(error);
    }
  };
}
