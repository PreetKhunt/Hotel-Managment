import { Pool } from 'pg';
import { IHotelRepository } from '../IHotelRepository';
import { Hotel, HotelStatus } from '../../entities/Hotel';
import { AppError, ErrorCode } from '../../../utils/AppError';

export class HotelRepository implements IHotelRepository {
  constructor(private readonly pool: Pool) {}

  private mapToHotel(row: any): Hotel {
    return {
      id: row.id,
      name: row.name,
      legalName: row.legal_name,
      email: row.email,
      phone: row.phone,
      gstNumber: row.gst_number,
      timezone: row.timezone,
      currency: row.currency,
      address: row.address,
      city: row.city,
      state: row.state,
      country: row.country,
      postalCode: row.postal_code,
      logoUrl: row.logo_url,
      status: row.status as HotelStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findById(id: string): Promise<Hotel | null> {
    const res = await this.pool.query('SELECT * FROM hotels WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return this.mapToHotel(res.rows[0]);
  }

  async findAll(): Promise<Hotel[]> {
    const res = await this.pool.query('SELECT * FROM hotels ORDER BY name ASC');
    return res.rows.map(this.mapToHotel);
  }

  async update(id: string, data: Partial<Hotel>): Promise<Hotel> {
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const dbMapping: Record<string, string> = {
      name: 'name',
      legalName: 'legal_name',
      email: 'email',
      phone: 'phone',
      gstNumber: 'gst_number',
      timezone: 'timezone',
      currency: 'currency',
      address: 'address',
      city: 'city',
      state: 'state',
      country: 'country',
      postalCode: 'postal_code',
      logoUrl: 'logo_url',
      status: 'status'
    };

    for (const [key, value] of Object.entries(data)) {
      if (dbMapping[key] !== undefined && value !== undefined) {
        updates.push(`"${dbMapping[key]}" = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    if (updates.length === 0) {
      const existing = await this.findById(id);
      if (!existing) throw new AppError('Hotel not found', 404, ErrorCode.NOT_FOUND);
      return existing;
    }

    values.push(id);
    const query = `
      UPDATE hotels 
      SET ${updates.join(', ')} 
      WHERE id = $${idx} 
      RETURNING *
    `;

    const res = await this.pool.query(query, values);
    if (res.rows.length === 0) {
      throw new AppError('Hotel not found', 404, ErrorCode.NOT_FOUND);
    }
    return this.mapToHotel(res.rows[0]);
  }
}
