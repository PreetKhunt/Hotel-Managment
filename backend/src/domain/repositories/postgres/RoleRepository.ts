import { Pool } from 'pg';
import { Role } from '../../entities/Role';
import { Permission } from '../../entities/Permission';
import { IRoleRepository } from '../IRoleRepository';

export class RoleRepository implements IRoleRepository {
  constructor(private pool: Pool) {}

  private mapToRole(row: any): Role {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      isSystem: row.is_system,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findById(id: string): Promise<Role | null> {
    const result = await this.pool.query('SELECT * FROM roles WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapToRole(result.rows[0]);
  }

  async findByName(name: string): Promise<Role | null> {
    const result = await this.pool.query('SELECT * FROM roles WHERE name = $1', [name]);
    if (result.rows.length === 0) return null;
    return this.mapToRole(result.rows[0]);
  }

  async findAll(): Promise<Role[]> {
    const result = await this.pool.query('SELECT * FROM roles ORDER BY created_at ASC');
    return result.rows.map(this.mapToRole);
  }

  async getPermissionsForRole(roleId: string): Promise<Permission[]> {
    const result = await this.pool.query(
      `SELECT p.id, p.name, p.description 
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = $1`,
      [roleId]
    );
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
    }));
  }

  async userHasPermission(userId: string, permissionName: string): Promise<boolean> {
    const result = await this.pool.query(
      `SELECT 1 
       FROM users u
       JOIN role_permissions rp ON u.role_id = rp.role_id
       JOIN permissions p ON rp.permission_id = p.id
       WHERE u.id = $1 AND (p.name = $2 OR p.name = 'full_access')
       LIMIT 1`,
      [userId, permissionName]
    );
    return result.rows.length > 0;
  }
}
