import { Role } from '../entities/Role';
import { Permission } from '../entities/Permission';

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  getPermissionsForRole(roleId: string): Promise<Permission[]>;
  userHasPermission(userId: string, permissionName: string): Promise<boolean>;
}
