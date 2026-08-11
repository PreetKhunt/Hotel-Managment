import { Request, Response, NextFunction } from 'express';
import { ManaliService } from '../services/ManaliService';
import { AppError, ErrorCode } from '../utils/AppError';

export class ManaliController {
  constructor(private readonly manaliService: ManaliService) {}

  // PLACES
  public getPlaces = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, search, limit, offset } = req.query;
      const result = await this.manaliService.getPlaces({
        category: category as string,
        search: search as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });

      res.status(200).json({ success: true, data: result.data, total: result.total });
    } catch (error) {
      next(error);
    }
  };

  public getPlaceById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const place = await this.manaliService.getPlaceById(req.params.id);
      if (!place) throw new AppError('Not found', 404, ErrorCode.NOT_FOUND);
      res.status(200).json({ success: true, data: place });
    } catch (error) {
      next(error);
    }
  };

  public createPlace = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const place = await this.manaliService.createPlace(req.body);
      res.status(201).json({ success: true, data: place, message: 'Place created successfully' });
    } catch (error) {
      next(error);
    }
  };

  public updatePlace = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const place = await this.manaliService.updatePlace(req.params.id, req.body);
      res.status(200).json({ success: true, data: place, message: 'Place updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  public deletePlace = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.manaliService.deletePlace(req.params.id);
      res.status(200).json({ success: true, message: 'Place deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // ACTIVITIES
  public getActivities = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, search, limit, offset } = req.query;
      const result = await this.manaliService.getActivities({
        category: category as string,
        search: search as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });

      res.status(200).json({ success: true, data: result.data, total: result.total });
    } catch (error) {
      next(error);
    }
  };

  public getActivityById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activity = await this.manaliService.getActivityById(req.params.id);
      if (!activity) throw new AppError('Not found', 404, ErrorCode.NOT_FOUND);
      res.status(200).json({ success: true, data: activity });
    } catch (error) {
      next(error);
    }
  };

  public createActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activity = await this.manaliService.createActivity(req.body);
      res.status(201).json({ success: true, data: activity, message: 'Activity created successfully' });
    } catch (error) {
      next(error);
    }
  };

  public updateActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activity = await this.manaliService.updateActivity(req.params.id, req.body);
      res.status(200).json({ success: true, data: activity, message: 'Activity updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  public deleteActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.manaliService.deleteActivity(req.params.id);
      res.status(200).json({ success: true, message: 'Activity deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // FOODS
  public getFoods = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, search, limit, offset } = req.query;
      const result = await this.manaliService.getFoods({
        category: category as string,
        search: search as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });

      res.status(200).json({ success: true, data: result.data, total: result.total });
    } catch (error) {
      next(error);
    }
  };

  public getFoodById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const food = await this.manaliService.getFoodById(req.params.id);
      if (!food) throw new AppError('Not found', 404, ErrorCode.NOT_FOUND);
      res.status(200).json({ success: true, data: food });
    } catch (error) {
      next(error);
    }
  };

  public createFood = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const food = await this.manaliService.createFood(req.body);
      res.status(201).json({ success: true, data: food, message: 'Food recommendation created successfully' });
    } catch (error) {
      next(error);
    }
  };

  public updateFood = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const food = await this.manaliService.updateFood(req.params.id, req.body);
      res.status(200).json({ success: true, data: food, message: 'Food recommendation updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  public deleteFood = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.manaliService.deleteFood(req.params.id);
      res.status(200).json({ success: true, message: 'Food recommendation deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // OTHER MODULES (Packing, Weather, Travel, Emergency, Transport)
  // PACKING
  public getPackingGuides = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.manaliService.getPackingGuides(req.query.season as string);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  public createPackingGuide = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.manaliService.createPackingGuide(req.body);
      res.status(201).json({ success: true, data, message: 'Packing guide created' });
    } catch (error) {
      next(error);
    }
  };

  public updatePackingGuide = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.manaliService.updatePackingGuide(req.params.id, req.body);
      res.status(200).json({ success: true, data, message: 'Packing guide updated' });
    } catch (error) {
      next(error);
    }
  };

  public deletePackingGuide = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.manaliService.deletePackingGuide(req.params.id);
      res.status(200).json({ success: true, message: 'Packing guide deleted' });
    } catch (error) {
      next(error);
    }
  };

  // WEATHER
  public getWeatherTips = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.manaliService.getWeatherTips(req.query.season as string);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  public createWeatherTip = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.manaliService.createWeatherTip(req.body);
      res.status(201).json({ success: true, data, message: 'Weather tip created' });
    } catch (error) {
      next(error);
    }
  };

  public updateWeatherTip = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.manaliService.updateWeatherTip(req.params.id, req.body);
      res.status(200).json({ success: true, data, message: 'Weather tip updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteWeatherTip = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.manaliService.deleteWeatherTip(req.params.id);
      res.status(200).json({ success: true, message: 'Weather tip deleted' });
    } catch (error) {
      next(error);
    }
  };

  // TRAVEL TIPS
  public getTravelTips = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.manaliService.getTravelTips();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  public createTravelTip = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.manaliService.createTravelTip(req.body);
      res.status(201).json({ success: true, data, message: 'Travel tip created' });
    } catch (error) {
      next(error);
    }
  };

  public updateTravelTip = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.manaliService.updateTravelTip(req.params.id, req.body);
      res.status(200).json({ success: true, data, message: 'Travel tip updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteTravelTip = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.manaliService.deleteTravelTip(req.params.id);
      res.status(200).json({ success: true, message: 'Travel tip deleted' });
    } catch (error) {
      next(error);
    }
  };

  // EMERGENCY CONTACTS
  public getEmergencyContacts = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.manaliService.getEmergencyContacts();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  public createEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.manaliService.createEmergencyContact(req.body);
      res.status(201).json({ success: true, data, message: 'Emergency contact created' });
    } catch (error) {
      next(error);
    }
  };

  public updateEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.manaliService.updateEmergencyContact(req.params.id, req.body);
      res.status(200).json({ success: true, data, message: 'Emergency contact updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.manaliService.deleteEmergencyContact(req.params.id);
      res.status(200).json({ success: true, message: 'Emergency contact deleted' });
    } catch (error) {
      next(error);
    }
  };

  // TRANSPORT
  public getTransport = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.manaliService.getTransport();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  public createTransport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.manaliService.createTransport(req.body);
      res.status(201).json({ success: true, data, message: 'Transport option created' });
    } catch (error) {
      next(error);
    }
  };

  public updateTransport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.manaliService.updateTransport(req.params.id, req.body);
      res.status(200).json({ success: true, data, message: 'Transport option updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteTransport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.manaliService.deleteTransport(req.params.id);
      res.status(200).json({ success: true, message: 'Transport option deleted' });
    } catch (error) {
      next(error);
    }
  };

  // FAVORITES
  public addFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED);

      const { itemType, itemId } = req.body;
      if (!['place', 'activity', 'food'].includes(itemType)) {
        throw new AppError('Validation Error', 400, ErrorCode.VALIDATION_ERROR);
      }

      await this.manaliService.addFavorite(user.id, itemType as any, itemId);
      res.status(200).json({ success: true, message: 'Added to favorites' });
    } catch (error) {
      next(error);
    }
  };

  public removeFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED);

      const { itemType, itemId } = req.params;
      if (!['place', 'activity', 'food'].includes(itemType)) {
        throw new AppError('Validation Error', 400, ErrorCode.VALIDATION_ERROR);
      }

      await this.manaliService.removeFavorite(user.id, itemType as any, itemId);
      res.status(200).json({ success: true, message: 'Removed from favorites' });
    } catch (error) {
      next(error);
    }
  };

  public getFavorites = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED);

      const favorites = await this.manaliService.getFavorites(user.id);
      res.status(200).json({ success: true, data: favorites });
    } catch (error) {
      next(error);
    }
  };
}
