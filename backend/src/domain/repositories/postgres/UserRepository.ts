import { Pool } from 'pg';
import { User, UserStatus } from '../../entities/User';
import { IUserRepository } from '../IUserRepository';

export class UserRepository implements IUserRepository {
  constructor(private pool: Pool) {}

  private mapToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      roleId: row.role_id,
      status: row.status as UserStatus,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      avatarUrl: row.avatar_url,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      address: row.address,
      city: row.city,
      state: row.state,
      country: row.country,
      postalCode: row.postal_code,
      lastLoginAt: row.last_login_at,
      deletedAt: row.deleted_at,
      deletedBy: row.deleted_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query('SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (result.rows.length === 0) return null;
    return this.mapToUser(result.rows[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query('SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
    if (result.rows.length === 0) return null;
    return this.mapToUser(result.rows[0]);
  }

  async create(user: User): Promise<User> {
    // Note: Most users are created by the Supabase auth trigger. 
    // This method is for programmatic creation if needed.
    const result = await this.pool.query(
      `INSERT INTO users (
        id, email, role_id, status, first_name, last_name, phone, avatar_url, date_of_birth, gender, address, city, state, country, postal_code
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      ) RETURNING *`,
      [
        user.id, user.email, user.roleId, user.status, user.firstName, user.lastName, user.phone,
        user.avatarUrl, user.dateOfBirth, user.gender, user.address, user.city, user.state, user.country, user.postalCode
      ]
    );
    return this.mapToUser(result.rows[0]);
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    const fields: string[] = [];
    const values: any[] = [];
    let queryIndex = 1;

    // Helper to add field dynamically
    const addField = (column: string, value: any) => {
      if (value !== undefined) {
        fields.push(`${column} = $${queryIndex++}`);
        values.push(value);
      }
    };

    addField('role_id', user.roleId);
    addField('status', user.status);
    addField('first_name', user.firstName);
    addField('last_name', user.lastName);
    addField('phone', user.phone);
    addField('avatar_url', user.avatarUrl);
    addField('date_of_birth', user.dateOfBirth);
    addField('gender', user.gender);
    addField('address', user.address);
    addField('city', user.city);
    addField('state', user.state);
    addField('country', user.country);
    addField('postal_code', user.postalCode);
    addField('last_login_at', user.lastLoginAt);

    if (fields.length === 0) {
      const existing = await this.findById(id);
      if (!existing) throw new Error('User not found');
      return existing;
    }

    fields.push(`updated_at = NOW()`);
    
    values.push(id);
    const result = await this.pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${queryIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) throw new Error('User not found');
    return this.mapToUser(result.rows[0]);
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    await this.pool.query(
      `UPDATE users SET deleted_at = NOW(), deleted_by = $1, status = 'deleted' WHERE id = $2`,
      [deletedBy, id]
    );
  }

  async findAll(status?: UserStatus): Promise<User[]> {
    let query = 'SELECT * FROM users WHERE deleted_at IS NULL';
    const values: any[] = [];

    if (status) {
      query += ' AND status = $1';
      values.push(status);
    }

    const result = await this.pool.query(query, values);
    return result.rows.map(this.mapToUser);
  }
}
