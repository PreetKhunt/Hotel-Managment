import { Pool, PoolClient } from 'pg';
import { IShoppingRepository, PartnerShop, PartnerOffer, UserCoupon, PaginatedResult, CouponStatus } from '../IShoppingRepository';

export class ShoppingRepository implements IShoppingRepository {
  constructor(private pool: Pool) {}

  private async query<T>(text: string, params: any[], client?: PoolClient): Promise<T[]> {
    const executor = client || this.pool;
    const result = await executor.query(text, params);
    return result.rows;
  }

  // Shops
  async getShops(filters?: { category?: string; search?: string; brand?: string; limit?: number; offset?: number }, client?: PoolClient): Promise<PaginatedResult<PartnerShop>> {
    let query = `SELECT * FROM partner_shops WHERE deleted_at IS NULL`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(filters.category);
    }
    if (filters?.brand) {
      query += ` AND brand_name = $${paramIndex++}`;
      params.push(filters.brand);
    }
    if (filters?.search) {
      query += ` AND (shop_name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
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

    const data = await this.query<PartnerShop>(query, params, client);
    return { data, total };
  }

  async getShopById(id: string, client?: PoolClient): Promise<PartnerShop | null> {
    const rows = await this.query<PartnerShop>('SELECT * FROM partner_shops WHERE id = $1 AND deleted_at IS NULL', [id], client);
    return rows[0] || null;
  }

  async createShop(data: Partial<PartnerShop>, client?: PoolClient): Promise<PartnerShop> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'deleted_at');
    const values = fields.map(k => (data as any)[k]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO partner_shops (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const rows = await this.query<PartnerShop>(query, values, client);
    return rows[0];
  }

  async updateShop(id: string, data: Partial<PartnerShop>, client?: PoolClient): Promise<PartnerShop> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'deleted_at');
    const setClause = fields.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [id, ...fields.map(k => (data as any)[k])];
    const query = `UPDATE partner_shops SET ${setClause} WHERE id = $1 AND deleted_at IS NULL RETURNING *`;
    const rows = await this.query<PartnerShop>(query, values, client);
    if (!rows[0]) throw new Error('Shop not found');
    return rows[0];
  }

  async deleteShop(id: string, client?: PoolClient): Promise<void> {
    await this.query('UPDATE partner_shops SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id], client);
  }

  // Offers
  async getOffers(filters?: { shop_id?: string; active_only?: boolean; limit?: number; offset?: number }, client?: PoolClient): Promise<PaginatedResult<PartnerOffer>> {
    let query = `
      SELECT o.*, s.shop_name, s.brand_name 
      FROM partner_offers o
      LEFT JOIN partner_shops s ON o.shop_id = s.id
      WHERE o.deleted_at IS NULL AND s.deleted_at IS NULL
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.shop_id) {
      query += ` AND o.shop_id = $${paramIndex++}`;
      params.push(filters.shop_id);
    }
    if (filters?.active_only) {
      query += ` AND o.expiry_date > CURRENT_TIMESTAMP`;
    }

    const countQuery = `SELECT COUNT(*) FROM (${query}) as q`;
    const countResult = await this.query<{count: string}>(countQuery, params, client);
    const total = parseInt(countResult[0]?.count || '0', 10);

    query += ` ORDER BY o.created_at DESC`;

    if (filters?.limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }
    if (filters?.offset) {
      query += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    const data = await this.query<PartnerOffer>(query, params, client);
    return { data, total };
  }

  async getOfferById(id: string, client?: PoolClient): Promise<PartnerOffer | null> {
    const rows = await this.query<PartnerOffer>(`
      SELECT o.*, s.shop_name, s.brand_name 
      FROM partner_offers o
      LEFT JOIN partner_shops s ON o.shop_id = s.id
      WHERE o.id = $1 AND o.deleted_at IS NULL
    `, [id], client);
    return rows[0] || null;
  }

  async createOffer(data: Partial<PartnerOffer>, client?: PoolClient): Promise<PartnerOffer> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'deleted_at');
    const values = fields.map(k => (data as any)[k]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO partner_offers (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const rows = await this.query<PartnerOffer>(query, values, client);
    return rows[0];
  }

  async updateOffer(id: string, data: Partial<PartnerOffer>, client?: PoolClient): Promise<PartnerOffer> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'deleted_at');
    const setClause = fields.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [id, ...fields.map(k => (data as any)[k])];
    const query = `UPDATE partner_offers SET ${setClause} WHERE id = $1 AND deleted_at IS NULL RETURNING *`;
    const rows = await this.query<PartnerOffer>(query, values, client);
    if (!rows[0]) throw new Error('Offer not found');
    return rows[0];
  }

  async deleteOffer(id: string, client?: PoolClient): Promise<void> {
    await this.query('UPDATE partner_offers SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id], client);
  }

  // Coupons
  async generateCoupon(data: Partial<UserCoupon>, client?: PoolClient): Promise<UserCoupon> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'deleted_at');
    const values = fields.map(k => (data as any)[k]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO user_coupons (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const rows = await this.query<UserCoupon>(query, values, client);
    return rows[0];
  }

  // Atomic state transition for coupon redemption
  async redeemCouponAtomic(coupon_code: string, user_id: string, client?: PoolClient): Promise<UserCoupon> {
    const executor = client || await this.pool.connect();
    let isOwner = false;
    if (!client) {
      isOwner = true;
      await (executor as PoolClient).query('BEGIN');
    }

    try {
      // 1. Lock the offer row for update to check limits atomically
      const offerCheckQuery = `
        SELECT o.id, o.max_redemptions, o.current_redemptions, c.id as coupon_id
        FROM user_coupons c
        JOIN partner_offers o ON c.offer_id = o.id
        WHERE c.coupon_code = $1 
          AND c.user_id = $2 
          AND c.status = 'generated'
          AND c.expiry_date > CURRENT_TIMESTAMP
        FOR UPDATE OF o
      `;
      
      const offerRows = await executor.query(offerCheckQuery, [coupon_code, user_id]);
      if (!offerRows.rows[0]) {
        throw new Error('Coupon is invalid, already redeemed, expired, or does not belong to user');
      }

      const offer = offerRows.rows[0];

      // 2. Enforce global offer limit
      if (offer.max_redemptions > 0 && offer.current_redemptions >= offer.max_redemptions) {
        throw new Error('This offer has reached its maximum redemption limit');
      }

      // 3. Mark coupon as redeemed
      const redeemQuery = `
        UPDATE user_coupons
        SET status = 'redeemed', redeemed_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      const couponRows = await executor.query(redeemQuery, [offer.coupon_id]);

      // 4. Increment offer redemptions
      await executor.query(`UPDATE partner_offers SET current_redemptions = current_redemptions + 1 WHERE id = $1`, [offer.id]);

      if (isOwner) await (executor as PoolClient).query('COMMIT');
      return couponRows.rows[0];
    } catch (error) {
      if (isOwner) await (executor as PoolClient).query('ROLLBACK');
      throw error;
    } finally {
      if (isOwner) (executor as PoolClient).release();
    }
  }

  async getCouponsByUser(userId: string, filters?: { status?: CouponStatus }, client?: PoolClient): Promise<UserCoupon[]> {
    let query = `
      SELECT c.*, o.title as offer_title, o.offer_type, s.shop_name, s.brand_name
      FROM user_coupons c
      JOIN partner_offers o ON c.offer_id = o.id
      JOIN partner_shops s ON c.partner_shop_id = s.id
      WHERE c.user_id = $1
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (filters?.status) {
      query += ` AND c.status = $${paramIndex++}`;
      params.push(filters.status);
    }

    query += ` ORDER BY c.created_at DESC`;
    
    return this.query<UserCoupon>(query, params, client);
  }

  async getCouponByCode(coupon_code: string, client?: PoolClient): Promise<UserCoupon | null> {
    const rows = await this.query<UserCoupon>('SELECT * FROM user_coupons WHERE coupon_code = $1', [coupon_code], client);
    return rows[0] || null;
  }

  async cancelCoupon(id: string, client?: PoolClient): Promise<UserCoupon> {
    const rows = await this.query<UserCoupon>(
      `UPDATE user_coupons SET status = 'cancelled' WHERE id = $1 RETURNING *`,
      [id],
      client
    );
    if (!rows[0]) throw new Error('Coupon not found');
    return rows[0];
  }
}
