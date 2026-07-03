import { createAuthMiddleware, requirePermission } from './authMiddleware';
import { supabase } from '../config/supabase';
import { UserRepository } from '../domain/repositories/postgres/UserRepository';
import { RoleRepository } from '../domain/repositories/postgres/RoleRepository';
import { pgPool as pool } from '../config/database';

const userRepo = new UserRepository(pool);
const roleRepo = new RoleRepository(pool);

export const authenticate = createAuthMiddleware(supabase, userRepo, roleRepo);
export { requirePermission };
