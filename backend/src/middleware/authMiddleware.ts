import { Request, Response, NextFunction } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import { IRoleRepository } from '../domain/repositories/IRoleRepository';
import { AppError, ErrorCode } from '../utils/AppError';
import { authConfig } from '../config/auth';
import { UserStatus } from '../domain/entities/User';

// We extend the Express Request interface to include our user payload
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roleId: string | null;
        roleName: string | null;
        status: UserStatus;
        permissions: string[];
      };
    }
  }
}

export const createAuthMiddleware = (
  _supabase: SupabaseClient,
  userRepo: IUserRepository,
  roleRepo: IRoleRepository
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Extract token from header or cookie
      let token = req.cookies[authConfig.session.cookieName];
      if (!token && req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        console.error(`[AuthMiddleware] Token missing. Cookies received:`, req.cookies);
        console.error(`[AuthMiddleware] Origin: ${req.headers.origin}, Referer: ${req.headers.referer}`);
        throw new AppError('Authentication token missing', 401, ErrorCode.UNAUTHORIZED);
      }

      // Verify JWT with Supabase
      // IMPORTANT: We use a temporary client here instead of the global `supabase` client.
      // Calling `getUser(token)` sets the in-memory session. Doing this on the global 
      // service role client pollutes it with the user's token for all subsequent requests,
      // which causes RLS to apply to public endpoints like GET /rooms (returning 0 rows).
      const { createClient } = require('@supabase/supabase-js');
      const { env } = require('../config/env');
      const authClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      
      const { data: { user: authUser }, error } = await authClient.auth.getUser(token);

      if (error || !authUser) {
        throw new AppError('Invalid or expired authentication token', 401, ErrorCode.UNAUTHORIZED);
      }

      // Fetch user details from public schema
      const dbUser = await userRepo.findById(authUser.id);
      
      if (!dbUser) {
        throw new AppError('User profile not found', 401, ErrorCode.UNAUTHORIZED);
      }

      if (dbUser.status === UserStatus.SUSPENDED || dbUser.status === UserStatus.DELETED || dbUser.status === UserStatus.INACTIVE) {
        throw new AppError('User account is inactive or suspended', 403, ErrorCode.FORBIDDEN);
      }

      let roleName: string | null = null;
      let permissions: string[] = [];

      if (dbUser.roleId) {
        const role = await roleRepo.findById(dbUser.roleId);
        if (role) {
          roleName = role.name;
          const perms = await roleRepo.getPermissionsForRole(role.id);
          permissions = perms.map(p => p.name);
        }
      }

      // Attach user to request
      req.user = {
        id: dbUser.id,
        email: dbUser.email,
        roleId: dbUser.roleId,
        roleName,
        status: dbUser.status,
        permissions,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requirePermission = (permission: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required for this action', 401, ErrorCode.UNAUTHORIZED);
      }

      if (req.user.permissions.includes('full_access') || req.user.permissions.includes(permission)) {
        return next();
      }

      throw new AppError('Insufficient permissions', 403, ErrorCode.FORBIDDEN);
    } catch (error) {
      next(error);
    }
  };
};
