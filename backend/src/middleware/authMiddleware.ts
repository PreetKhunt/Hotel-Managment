import { Request, Response, NextFunction } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import { IRoleRepository } from '../domain/repositories/IRoleRepository';
import { AppError, ErrorCode } from '../utils/AppError';

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
      console.log(`[Auth Debug] Incoming req.headers.cookie:`, req.headers.cookie);
      console.log(`[Auth Debug] Parsed req.cookies:`, JSON.stringify(req.cookies));
      let token = req.headers.authorization?.startsWith('Bearer ') 
        ? req.headers.authorization.split(' ')[1] 
        : undefined;

      // Use @supabase/ssr to automatically parse sb-*-auth-token cookies
      const { createServerClient } = require('@supabase/ssr');
      const { env } = require('../config/env');
      
      const authClient = createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
        cookies: {
          getAll() {
            return Object.keys(req.cookies).map((name) => ({ name, value: req.cookies[name] }));
          },
          setAll() {} // Read-only for middleware
        }
      });
      
      // If there's an explicit Authorization header, we can verify that token.
      // Otherwise, getUser() will automatically use the parsed session from the cookies.
      const { data: { user: authUser }, error } = token 
        ? await authClient.auth.getUser(token)
        : await authClient.auth.getUser();

      if (error || !authUser) {
        console.error(`[AuthMiddleware] JWT Verification Failed:`, error?.message || 'No user found');
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
