import { Router } from 'express';
import { ManaliController } from '../controllers/manaliController';
import { ManaliService } from '../services/ManaliService';
import { ManaliRepository } from '../domain/repositories/postgres/ManaliRepository';
import { pgPool as pool } from '../config/database';
import { authenticate, requirePermission } from '../middleware/auth';
import { validateRequest } from '../middleware/validationHandler';
import {
  manaliPlaceSchema, updateManaliPlaceSchema,
  manaliActivitySchema, updateManaliActivitySchema,
  manaliFoodSchema, updateManaliFoodSchema,
  manaliPackingGuideSchema, updateManaliPackingGuideSchema,
  manaliWeatherTipSchema, updateManaliWeatherTipSchema,
  manaliTravelTipSchema, updateManaliTravelTipSchema,
  manaliEmergencyContactSchema, updateManaliEmergencyContactSchema,
  manaliTransportSchema, updateManaliTransportSchema
} from '../validations/manaliValidations';

const router = Router();
const manaliRepo = new ManaliRepository(pool);
const manaliService = new ManaliService(manaliRepo);
const manaliController = new ManaliController(manaliService);

// ----------------------------------------------------------------------------
// PUBLIC ROUTES
// ----------------------------------------------------------------------------
router.get('/places', manaliController.getPlaces);
router.get('/places/:id', manaliController.getPlaceById);

router.get('/activities', manaliController.getActivities);
router.get('/activities/:id', manaliController.getActivityById);

router.get('/food', manaliController.getFoods);
router.get('/food/:id', manaliController.getFoodById);

router.get('/packing-guides', manaliController.getPackingGuides);
router.get('/weather-tips', manaliController.getWeatherTips);
router.get('/travel-tips', manaliController.getTravelTips);
router.get('/emergency-contacts', manaliController.getEmergencyContacts);
router.get('/transport', manaliController.getTransport);

// ----------------------------------------------------------------------------
// AUTHENTICATED USER ROUTES (Favorites)
// ----------------------------------------------------------------------------
router.use('/favorites', authenticate);
router.get('/favorites', manaliController.getFavorites);
router.post('/favorites', manaliController.addFavorite);
router.delete('/favorites/:itemType/:itemId', manaliController.removeFavorite);

// ----------------------------------------------------------------------------
// ADMIN ROUTES (CRUD)
// ----------------------------------------------------------------------------
router.use(authenticate);
router.use(requirePermission('full_access'));

router.post('/places', validateRequest(manaliPlaceSchema), manaliController.createPlace);
router.patch('/places/:id', validateRequest(updateManaliPlaceSchema), manaliController.updatePlace);
router.delete('/places/:id', manaliController.deletePlace);

router.post('/activities', validateRequest(manaliActivitySchema), manaliController.createActivity);
router.patch('/activities/:id', validateRequest(updateManaliActivitySchema), manaliController.updateActivity);
router.delete('/activities/:id', manaliController.deleteActivity);

router.post('/food', validateRequest(manaliFoodSchema), manaliController.createFood);
router.patch('/food/:id', validateRequest(updateManaliFoodSchema), manaliController.updateFood);
router.delete('/food/:id', manaliController.deleteFood);

router.post('/packing-guides', validateRequest(manaliPackingGuideSchema), manaliController.createPackingGuide);
router.patch('/packing-guides/:id', validateRequest(updateManaliPackingGuideSchema), manaliController.updatePackingGuide);
router.delete('/packing-guides/:id', manaliController.deletePackingGuide);

router.post('/weather-tips', validateRequest(manaliWeatherTipSchema), manaliController.createWeatherTip);
router.patch('/weather-tips/:id', validateRequest(updateManaliWeatherTipSchema), manaliController.updateWeatherTip);
router.delete('/weather-tips/:id', manaliController.deleteWeatherTip);

router.post('/travel-tips', validateRequest(manaliTravelTipSchema), manaliController.createTravelTip);
router.patch('/travel-tips/:id', validateRequest(updateManaliTravelTipSchema), manaliController.updateTravelTip);
router.delete('/travel-tips/:id', manaliController.deleteTravelTip);

router.post('/emergency-contacts', validateRequest(manaliEmergencyContactSchema), manaliController.createEmergencyContact);
router.patch('/emergency-contacts/:id', validateRequest(updateManaliEmergencyContactSchema), manaliController.updateEmergencyContact);
router.delete('/emergency-contacts/:id', manaliController.deleteEmergencyContact);

router.post('/transport', validateRequest(manaliTransportSchema), manaliController.createTransport);
router.patch('/transport/:id', validateRequest(updateManaliTransportSchema), manaliController.updateTransport);
router.delete('/transport/:id', manaliController.deleteTransport);

export default router;
