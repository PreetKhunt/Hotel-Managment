import { IManaliRepository, ManaliPlace, ManaliActivity, ManaliFood, ManaliPackingGuide, ManaliWeatherTip, ManaliTravelTip, ManaliEmergencyContact, ManaliTransport, PaginatedResult } from '../domain/repositories/IManaliRepository';

export class ManaliService {
  constructor( private manaliRepo: IManaliRepository) {}

  // PLACES
  async getPlaces(filters?: { category?: string; search?: string; limit?: number; offset?: number }): Promise<PaginatedResult<ManaliPlace>> {
    return this.manaliRepo.getPlaces(filters);
  }

  async getPlaceById(id: string): Promise<ManaliPlace | null> {
    return this.manaliRepo.getPlaceById(id);
  }

  async createPlace(data: Partial<ManaliPlace>): Promise<ManaliPlace> {
    return this.manaliRepo.createPlace(data);
  }

  async updatePlace(id: string, data: Partial<ManaliPlace>): Promise<ManaliPlace> {
    return this.manaliRepo.updatePlace(id, data);
  }

  async deletePlace(id: string): Promise<void> {
    return this.manaliRepo.deletePlace(id);
  }

  // ACTIVITIES
  async getActivities(filters?: { category?: string; search?: string; limit?: number; offset?: number }): Promise<PaginatedResult<ManaliActivity>> {
    return this.manaliRepo.getActivities(filters);
  }

  async getActivityById(id: string): Promise<ManaliActivity | null> {
    return this.manaliRepo.getActivityById(id);
  }

  async createActivity(data: Partial<ManaliActivity>): Promise<ManaliActivity> {
    return this.manaliRepo.createActivity(data);
  }

  async updateActivity(id: string, data: Partial<ManaliActivity>): Promise<ManaliActivity> {
    return this.manaliRepo.updateActivity(id, data);
  }

  async deleteActivity(id: string): Promise<void> {
    return this.manaliRepo.deleteActivity(id);
  }

  // FOODS
  async getFoods(filters?: { category?: string; search?: string; limit?: number; offset?: number }): Promise<PaginatedResult<ManaliFood>> {
    return this.manaliRepo.getFoods(filters);
  }

  async getFoodById(id: string): Promise<ManaliFood | null> {
    return this.manaliRepo.getFoodById(id);
  }

  async createFood(data: Partial<ManaliFood>): Promise<ManaliFood> {
    return this.manaliRepo.createFood(data);
  }

  async updateFood(id: string, data: Partial<ManaliFood>): Promise<ManaliFood> {
    return this.manaliRepo.updateFood(id, data);
  }

  async deleteFood(id: string): Promise<void> {
    return this.manaliRepo.deleteFood(id);
  }

  // PACKING GUIDES
  async getPackingGuides(season?: string): Promise<ManaliPackingGuide[]> {
    return this.manaliRepo.getPackingGuides(season);
  }

  async createPackingGuide(data: Partial<ManaliPackingGuide>): Promise<ManaliPackingGuide> {
    return this.manaliRepo.createPackingGuide(data);
  }

  async updatePackingGuide(id: string, data: Partial<ManaliPackingGuide>): Promise<ManaliPackingGuide> {
    return this.manaliRepo.updatePackingGuide(id, data);
  }

  async deletePackingGuide(id: string): Promise<void> {
    return this.manaliRepo.deletePackingGuide(id);
  }

  // WEATHER TIPS
  async getWeatherTips(season?: string): Promise<ManaliWeatherTip[]> {
    return this.manaliRepo.getWeatherTips(season);
  }

  async createWeatherTip(data: Partial<ManaliWeatherTip>): Promise<ManaliWeatherTip> {
    return this.manaliRepo.createWeatherTip(data);
  }

  async updateWeatherTip(id: string, data: Partial<ManaliWeatherTip>): Promise<ManaliWeatherTip> {
    return this.manaliRepo.updateWeatherTip(id, data);
  }

  async deleteWeatherTip(id: string): Promise<void> {
    return this.manaliRepo.deleteWeatherTip(id);
  }

  // TRAVEL TIPS
  async getTravelTips(): Promise<ManaliTravelTip[]> {
    return this.manaliRepo.getTravelTips();
  }

  async createTravelTip(data: Partial<ManaliTravelTip>): Promise<ManaliTravelTip> {
    return this.manaliRepo.createTravelTip(data);
  }

  async updateTravelTip(id: string, data: Partial<ManaliTravelTip>): Promise<ManaliTravelTip> {
    return this.manaliRepo.updateTravelTip(id, data);
  }

  async deleteTravelTip(id: string): Promise<void> {
    return this.manaliRepo.deleteTravelTip(id);
  }

  // EMERGENCY CONTACTS
  async getEmergencyContacts(): Promise<ManaliEmergencyContact[]> {
    return this.manaliRepo.getEmergencyContacts();
  }

  async createEmergencyContact(data: Partial<ManaliEmergencyContact>): Promise<ManaliEmergencyContact> {
    return this.manaliRepo.createEmergencyContact(data);
  }

  async updateEmergencyContact(id: string, data: Partial<ManaliEmergencyContact>): Promise<ManaliEmergencyContact> {
    return this.manaliRepo.updateEmergencyContact(id, data);
  }

  async deleteEmergencyContact(id: string): Promise<void> {
    return this.manaliRepo.deleteEmergencyContact(id);
  }

  // TRANSPORT
  async getTransport(): Promise<ManaliTransport[]> {
    return this.manaliRepo.getTransport();
  }

  async createTransport(data: Partial<ManaliTransport>): Promise<ManaliTransport> {
    return this.manaliRepo.createTransport(data);
  }

  async updateTransport(id: string, data: Partial<ManaliTransport>): Promise<ManaliTransport> {
    return this.manaliRepo.updateTransport(id, data);
  }

  async deleteTransport(id: string): Promise<void> {
    return this.manaliRepo.deleteTransport(id);
  }

  // FAVORITES
  async addFavorite(userId: string, itemType: 'place' | 'activity' | 'food', itemId: string): Promise<void> {
    return this.manaliRepo.addFavorite(userId, itemType, itemId);
  }

  async removeFavorite(userId: string, itemType: 'place' | 'activity' | 'food', itemId: string): Promise<void> {
    return this.manaliRepo.removeFavorite(userId, itemType, itemId);
  }

  async getFavorites(userId: string): Promise<{ places: string[], activities: string[], foods: string[] }> {
    return this.manaliRepo.getFavorites(userId);
  }
}
