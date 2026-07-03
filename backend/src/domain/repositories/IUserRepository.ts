import { User, UserStatus } from '../entities/User';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string, deletedBy: string): Promise<void>; // Soft delete
  findAll(status?: UserStatus): Promise<User[]>;
}
