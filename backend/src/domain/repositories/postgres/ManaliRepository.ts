import { Pool, PoolClient } from 'pg';
import { 
  IManaliRepository, 
  ManaliPlace, 
  ManaliActivity, 
  ManaliFood, 
  ManaliPackingGuide, 
  ManaliWeatherTip, 
  ManaliTravelTip,
  ManaliEmergencyContact,
  ManaliTransport,
  PaginatedResult 
} from '../IManaliRepository';

export class ManaliRepository implements IManaliRepository {
  constructor(private pool: Pool) {}

  private async query<T>(text: string, params: any[], client?: PoolClient): Promise<T[]> {
    const executor = client || this.pool;
    const result = await executor.query(text, params);
    return result.rows;
  }

  // PLACES
  async getPlaces(filters?: { category?: string; search?: string; limit?: number; offset?: number }, client?: PoolClient): Promise<PaginatedResult<ManaliPlace>> {
    let query = `SELECT * FROM manali_places WHERE deleted_at IS NULL`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(filters.category);
    }
    if (filters?.search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const countQuery = `SELECT COUNT(*) FROM (${query}) as q`;
    const countResult = await this.query<{count: string}>(countQuery, params, client);
    const total = parseInt(countResult[0]?.count || '0', 10);

    query += ` ORDER BY created_at DESC`;

    if (filters?.limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }
    if (filters?.offset) {
      query += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    const data = await this.query<ManaliPlace>(query, params, client);
    return { data, total };
  }

  async getPlaceById(id: string, client?: PoolClient): Promise<ManaliPlace | null> {
    const rows = await this.query<ManaliPlace>('SELECT * FROM manali_places WHERE id = $1 AND deleted_at IS NULL', [id], client);
    return rows[0] || null;
  }

  async createPlace(data: Partial<ManaliPlace>, client?: PoolClient): Promise<ManaliPlace> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'deleted_at');
    const values = fields.map(k => (data as any)[k]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `INSERT INTO manali_places (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const rows = await this.query<ManaliPlace>(query, values, client);
    return rows[0];
  }

  async updatePlace(id: string, data: Partial<ManaliPlace>, client?: PoolClient): Promise<ManaliPlace> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'deleted_at');
    const setClause = fields.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [id, ...fields.map(k => (data as any)[k])];
    
    const query = `UPDATE manali_places SET ${setClause} WHERE id = $1 AND deleted_at IS NULL RETURNING *`;
    const rows = await this.query<ManaliPlace>(query, values, client);
    if (!rows[0]) throw new Error('Place not found');
    return rows[0];
  }

  async deletePlace(id: string, client?: PoolClient): Promise<void> {
    await this.query('UPDATE manali_places SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id], client);
  }

  // ACTIVITIES
  async getActivities(filters?: { category?: string; search?: string; limit?: number; offset?: number }, client?: PoolClient): Promise<PaginatedResult<ManaliActivity>> {
    let query = `SELECT * FROM manali_activities WHERE deleted_at IS NULL`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(filters.category);
    }
    if (filters?.search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const countQuery = `SELECT COUNT(*) FROM (${query}) as q`;
    const countResult = await this.query<{count: string}>(countQuery, params, client);
    const total = parseInt(countResult[0]?.count || '0', 10);

    query += ` ORDER BY created_at DESC`;

    if (filters?.limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }
    if (filters?.offset) {
      query += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    const data = await this.query<ManaliActivity>(query, params, client);
    return { data, total };
  }

  async getActivityById(id: string, client?: PoolClient): Promise<ManaliActivity | null> {
    const rows = await this.query<ManaliActivity>('SELECT * FROM manali_activities WHERE id = $1 AND deleted_at IS NULL', [id], client);
    return rows[0] || null;
  }

  async createActivity(data: Partial<ManaliActivity>, client?: PoolClient): Promise<ManaliActivity> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'deleted_at');
    const values = fields.map(k => (data as any)[k]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `INSERT INTO manali_activities (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const rows = await this.query<ManaliActivity>(query, values, client);
    return rows[0];
  }

  async updateActivity(id: string, data: Partial<ManaliActivity>, client?: PoolClient): Promise<ManaliActivity> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'deleted_at');
    const setClause = fields.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [id, ...fields.map(k => (data as any)[k])];
    
    const query = `UPDATE manali_activities SET ${setClause} WHERE id = $1 AND deleted_at IS NULL RETURNING *`;
    const rows = await this.query<ManaliActivity>(query, values, client);
    if (!rows[0]) throw new Error('Activity not found');
    return rows[0];
  }

  async deleteActivity(id: string, client?: PoolClient): Promise<void> {
    await this.query('UPDATE manali_activities SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id], client);
  }

  // FOOD
  async getFoods(filters?: { category?: string; search?: string; limit?: number; offset?: number }, client?: PoolClient): Promise<PaginatedResult<ManaliFood>> {
    let query = `SELECT * FROM manali_food_recommendations WHERE deleted_at IS NULL`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(filters.category);
    }
    if (filters?.search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const countQuery = `SELECT COUNT(*) FROM (${query}) as q`;
    const countResult = await this.query<{count: string}>(countQuery, params, client);
    const total = parseInt(countResult[0]?.count || '0', 10);

    query += ` ORDER BY created_at DESC`;

    if (filters?.limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }
    if (filters?.offset) {
      query += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    const data = await this.query<ManaliFood>(query, params, client);
    return { data, total };
  }

  async getFoodById(id: string, client?: PoolClient): Promise<ManaliFood | null> {
    const rows = await this.query<ManaliFood>('SELECT * FROM manali_food_recommendations WHERE id = $1 AND deleted_at IS NULL', [id], client);
    return rows[0] || null;
  }

  async createFood(data: Partial<ManaliFood>, client?: PoolClient): Promise<ManaliFood> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'deleted_at');
    const values = fields.map(k => (data as any)[k]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `INSERT INTO manali_food_recommendations (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const rows = await this.query<ManaliFood>(query, values, client);
    return rows[0];
  }

  async updateFood(id: string, data: Partial<ManaliFood>, client?: PoolClient): Promise<ManaliFood> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'deleted_at');
    const setClause = fields.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [id, ...fields.map(k => (data as any)[k])];
    
    const query = `UPDATE manali_food_recommendations SET ${setClause} WHERE id = $1 AND deleted_at IS NULL RETURNING *`;
    const rows = await this.query<ManaliFood>(query, values, client);
    if (!rows[0]) throw new Error('Food not found');
    return rows[0];
  }

  async deleteFood(id: string, client?: PoolClient): Promise<void> {
    await this.query('UPDATE manali_food_recommendations SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id], client);
  }

  // PACKING GUIDES
  async getPackingGuides(season?: string, client?: PoolClient): Promise<ManaliPackingGuide[]> {
    let query = `SELECT * FROM manali_packing_guides WHERE deleted_at IS NULL`;
    const params: any[] = [];
    if (season) {
      query += ' AND season = $1';
      params.push(season);
    }
    query += ' ORDER BY category ASC, item_name ASC';
    return this.query<ManaliPackingGuide>(query, params, client);
  }

  async createPackingGuide(data: Partial<ManaliPackingGuide>, client?: PoolClient): Promise<ManaliPackingGuide> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'deleted_at');
    const values = fields.map(k => (data as any)[k]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO manali_packing_guides (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const rows = await this.query<ManaliPackingGuide>(query, values, client);
    return rows[0];
  }

  async updatePackingGuide(id: string, data: Partial<ManaliPackingGuide>, client?: PoolClient): Promise<ManaliPackingGuide> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'deleted_at');
    const setClause = fields.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [id, ...fields.map(k => (data as any)[k])];
    const query = `UPDATE manali_packing_guides SET ${setClause} WHERE id = $1 AND deleted_at IS NULL RETURNING *`;
    const rows = await this.query<ManaliPackingGuide>(query, values, client);
    if (!rows[0]) throw new Error('Item not found');
    return rows[0];
  }

  async deletePackingGuide(id: string, client?: PoolClient): Promise<void> {
    await this.query('UPDATE manali_packing_guides SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id], client);
  }

  // WEATHER TIPS
  async getWeatherTips(season?: string, client?: PoolClient): Promise<ManaliWeatherTip[]> {
    let query = `SELECT * FROM manali_weather_tips WHERE deleted_at IS NULL`;
    const params: any[] = [];
    if (season) {
      query += ' AND season = $1';
      params.push(season);
    }
    query += ' ORDER BY season ASC';
    return this.query<ManaliWeatherTip>(query, params, client);
  }

  async createWeatherTip(data: Partial<ManaliWeatherTip>, client?: PoolClient): Promise<ManaliWeatherTip> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'deleted_at');
    const values = fields.map(k => (data as any)[k]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO manali_weather_tips (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const rows = await this.query<ManaliWeatherTip>(query, values, client);
    return rows[0];
  }

  async updateWeatherTip(id: string, data: Partial<ManaliWeatherTip>, client?: PoolClient): Promise<ManaliWeatherTip> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'deleted_at');
    const setClause = fields.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [id, ...fields.map(k => (data as any)[k])];
    const query = `UPDATE manali_weather_tips SET ${setClause} WHERE id = $1 AND deleted_at IS NULL RETURNING *`;
    const rows = await this.query<ManaliWeatherTip>(query, values, client);
    if (!rows[0]) throw new Error('Tip not found');
    return rows[0];
  }

  async deleteWeatherTip(id: string, client?: PoolClient): Promise<void> {
    await this.query('UPDATE manali_weather_tips SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id], client);
  }

  // TRAVEL TIPS
  async getTravelTips(client?: PoolClient): Promise<ManaliTravelTip[]> {
    return this.query<ManaliTravelTip>('SELECT * FROM manali_travel_tips WHERE deleted_at IS NULL ORDER BY created_at DESC', [], client);
  }

  async createTravelTip(data: Partial<ManaliTravelTip>, client?: PoolClient): Promise<ManaliTravelTip> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'deleted_at');
    const values = fields.map(k => (data as any)[k]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO manali_travel_tips (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const rows = await this.query<ManaliTravelTip>(query, values, client);
    return rows[0];
  }

  async updateTravelTip(id: string, data: Partial<ManaliTravelTip>, client?: PoolClient): Promise<ManaliTravelTip> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'deleted_at');
    const setClause = fields.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [id, ...fields.map(k => (data as any)[k])];
    const query = `UPDATE manali_travel_tips SET ${setClause} WHERE id = $1 AND deleted_at IS NULL RETURNING *`;
    const rows = await this.query<ManaliTravelTip>(query, values, client);
    if (!rows[0]) throw new Error('Tip not found');
    return rows[0];
  }

  async deleteTravelTip(id: string, client?: PoolClient): Promise<void> {
    await this.query('UPDATE manali_travel_tips SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id], client);
  }

  // EMERGENCY CONTACTS
  async getEmergencyContacts(client?: PoolClient): Promise<ManaliEmergencyContact[]> {
    return this.query<ManaliEmergencyContact>('SELECT * FROM manali_emergency_contacts WHERE deleted_at IS NULL ORDER BY created_at DESC', [], client);
  }

  async createEmergencyContact(data: Partial<ManaliEmergencyContact>, client?: PoolClient): Promise<ManaliEmergencyContact> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'deleted_at');
    const values = fields.map(k => (data as any)[k]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO manali_emergency_contacts (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const rows = await this.query<ManaliEmergencyContact>(query, values, client);
    return rows[0];
  }

  async updateEmergencyContact(id: string, data: Partial<ManaliEmergencyContact>, client?: PoolClient): Promise<ManaliEmergencyContact> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'deleted_at');
    const setClause = fields.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [id, ...fields.map(k => (data as any)[k])];
    const query = `UPDATE manali_emergency_contacts SET ${setClause} WHERE id = $1 AND deleted_at IS NULL RETURNING *`;
    const rows = await this.query<ManaliEmergencyContact>(query, values, client);
    if (!rows[0]) throw new Error('Contact not found');
    return rows[0];
  }

  async deleteEmergencyContact(id: string, client?: PoolClient): Promise<void> {
    await this.query('UPDATE manali_emergency_contacts SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id], client);
  }

  // TRANSPORT
  async getTransport(client?: PoolClient): Promise<ManaliTransport[]> {
    return this.query<ManaliTransport>('SELECT * FROM manali_transport WHERE deleted_at IS NULL ORDER BY created_at DESC', [], client);
  }

  async createTransport(data: Partial<ManaliTransport>, client?: PoolClient): Promise<ManaliTransport> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'deleted_at');
    const values = fields.map(k => (data as any)[k]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO manali_transport (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const rows = await this.query<ManaliTransport>(query, values, client);
    return rows[0];
  }

  async updateTransport(id: string, data: Partial<ManaliTransport>, client?: PoolClient): Promise<ManaliTransport> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'deleted_at');
    const setClause = fields.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [id, ...fields.map(k => (data as any)[k])];
    const query = `UPDATE manali_transport SET ${setClause} WHERE id = $1 AND deleted_at IS NULL RETURNING *`;
    const rows = await this.query<ManaliTransport>(query, values, client);
    if (!rows[0]) throw new Error('Transport not found');
    return rows[0];
  }

  async deleteTransport(id: string, client?: PoolClient): Promise<void> {
    await this.query('UPDATE manali_transport SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id], client);
  }

  // FAVORITES
  async addFavorite(userId: string, itemType: 'place' | 'activity' | 'food', itemId: string, client?: PoolClient): Promise<void> {
    const table = itemType === 'place' ? 'user_favorite_places' : itemType === 'activity' ? 'user_favorite_activities' : 'user_favorite_foods';
    const idField = itemType === 'place' ? 'place_id' : itemType === 'activity' ? 'activity_id' : 'food_id';
    
    // ON CONFLICT DO NOTHING to prevent duplicates safely
    await this.query(`INSERT INTO ${table} (user_id, ${idField}) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [userId, itemId], client);
  }

  async removeFavorite(userId: string, itemType: 'place' | 'activity' | 'food', itemId: string, client?: PoolClient): Promise<void> {
    const table = itemType === 'place' ? 'user_favorite_places' : itemType === 'activity' ? 'user_favorite_activities' : 'user_favorite_foods';
    const idField = itemType === 'place' ? 'place_id' : itemType === 'activity' ? 'activity_id' : 'food_id';
    
    await this.query(`DELETE FROM ${table} WHERE user_id = $1 AND ${idField} = $2`, [userId, itemId], client);
  }

  async getFavorites(userId: string, client?: PoolClient): Promise<{ places: string[], activities: string[], foods: string[] }> {
    const places = await this.query<{place_id: string}>('SELECT place_id FROM user_favorite_places WHERE user_id = $1', [userId], client);
    const activities = await this.query<{activity_id: string}>('SELECT activity_id FROM user_favorite_activities WHERE user_id = $1', [userId], client);
    const foods = await this.query<{food_id: string}>('SELECT food_id FROM user_favorite_foods WHERE user_id = $1', [userId], client);
    
    return {
      places: places.map(p => p.place_id),
      activities: activities.map(a => a.activity_id),
      foods: foods.map(f => f.food_id)
    };
  }
}
