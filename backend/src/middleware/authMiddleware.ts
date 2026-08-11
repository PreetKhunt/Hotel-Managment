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
    const debugReqId = req.headers['x-debug-request-id'] || 'MISSING';
    const isDebugAuth = process.env.NODE_ENV !== 'production' && process.env.DEBUG_AUTH === 'true';

    if (isDebugAuth) {
      console.log(`\n========== [AuthMiddleware] START REQ: ${debugReqId} ==========`);
      console.log(`[AuthMiddleware] req.originalUrl: ${req.originalUrl}`);
      console.log(`[AuthMiddleware] req.method: ${req.method}`);
    }

    const hasSession = !!(req.cookies && req.cookies.hh_session);
    const hasAuthHeader = !!req.headers.authorization?.startsWith('Bearer ');
    
    console.log(`[AuthMiddleware] hh_session exists: ${hasSession}`);
    if (isDebugAuth) {
      console.log(`[AuthMiddleware] Bearer token exists: ${hasAuthHeader}`);
    }

    try {
      // 1. Try to get token from Authorization header
      let token = hasAuthHeader 
        ? req.headers.authorization!.split(' ')[1] 
        : undefined;

      // 2. If no header, extract token from hh_session cookie
      if (!token && hasSession) {
        token = req.cookies.hh_session as string;
      }

      if (!token) {
        console.error(`[AuthMiddleware] REJECTED (401): Authentication token missing`);
        return next(new AppError('Authentication token missing', 401, ErrorCode.UNAUTHORIZED));
      }

      const { env } = require('../config/env');
      
      let authUser;
      
      const { createClient } = require('@supabase/supabase-js');
      const fallbackClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
         auth: { persistSession: false, autoRefreshToken: false }
      });
      
      const { data, error } = await fallbackClient.auth.getUser(token);
      
      if (error || !data.user) {
         console.error(`[AuthMiddleware] JWT Verification Failed (401).`);
         if (isDebugAuth) console.error(`[AuthMiddleware] Verification Error Details:`, error);
         throw new AppError('Invalid or expired authentication token', 401, ErrorCode.UNAUTHORIZED);
      }
      
      authUser = data.user;

      // Fetch user details from public schema
      const dbUser = await userRepo.findById(authUser.id);
      
      if (!dbUser) {
        console.error(`[AuthMiddleware] REJECTED (401): User profile not found in db`);
        throw new AppError('User profile not found', 401, ErrorCode.UNAUTHORIZED);
      }

      if (dbUser.status === UserStatus.SUSPENDED || dbUser.status === UserStatus.DELETED || dbUser.status === UserStatus.INACTIVE) {
        console.error(`[AuthMiddleware] REJECTED (403): User account status is ${dbUser.status}`);
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

      console.log(`[AuthMiddleware] Authentication successful`);
      console.log(`[AuthMiddleware] User ID: ${req.user.id.substring(0, 8)}...`);
      console.log(`[AuthMiddleware] Role: ${roleName || 'None'}`);

      if (isDebugAuth) {
        console.log(`========== [AuthMiddleware] END REQ: ${debugReqId} ==========\n`);
      }
      next();
    } catch (error) {
      if (isDebugAuth) {
        console.error(`========== [AuthMiddleware] END REQ: ${debugReqId} (WITH ERROR) ==========\n`);
      }
      next(error);
    }
  };
};

export const requirePermission = (permission: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        console.log(`[AuthMiddleware] requirePermission failed: No user found`);
        throw new AppError('Authentication required for this action', 401, ErrorCode.UNAUTHORIZED);
      }

      const isSuperAdmin = req.user.permissions.includes('SUPER_ADMIN') || req.user.roleName === 'Super Admin';
      const isAdmin = req.user.permissions.includes('full_access') || req.user.roleName === 'Admin' || req.user.roleName === 'Super Admin';

      if (isSuperAdmin || isAdmin || req.user.permissions.includes(permission)) {
        return next();
      }

      throw new AppError('Insufficient permissions', 403, ErrorCode.FORBIDDEN);
    } catch (error) {
      next(error);
    }
  };
};

export const requireSuperAdmin = () => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED);
      }

      // Explicitly check for SUPER_ADMIN permission, not role name.
      if (req.user.permissions.includes('SUPER_ADMIN')) {
        return next();
      }

      throw new AppError('Insufficient permissions. Super Admin access required.', 403, ErrorCode.FORBIDDEN);
    } catch (error) {
      next(error);
    }
  };
};
