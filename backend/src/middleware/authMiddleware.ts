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
      // 1. Try to get token from Authorization header
      let token = req.headers.authorization?.startsWith('Bearer ') 
        ? req.headers.authorization.split(' ')[1] 
        : undefined;

      // 2. If no header, extract the access_token manually from Supabase cookies
      // We do this manually to bypass @supabase/ssr's automatic session refresh logic
      // which throws "refresh_token_not_found" if the OAuth provider didn't return one.
      if (!token) {
        const { env } = require('../config/env');
        
        // Find the project ref from the Supabase URL
        // e.g. https://xyz.supabase.co -> xyz
        const supabaseUrl = new URL(env.SUPABASE_URL);
        const projectRef = supabaseUrl.hostname.split('.')[0];
        
        const cookiePrefix = `sb-${projectRef}-auth-token.`;
        
        // Collect all chunk keys
        const chunkKeys = Object.keys(req.cookies)
          .filter(key => key.startsWith(cookiePrefix))
          .sort((a, b) => {
            const idxA = parseInt(a.split('.').pop() || '0');
            const idxB = parseInt(b.split('.').pop() || '0');
            return idxA - idxB;
          });
          
        if (chunkKeys.length > 0) {
          try {
            // Concatenate chunks
            const rawValue = chunkKeys.map(key => req.cookies[key]).join('');
            
            // The value is usually prefixed with 'base64-'
            let jsonStr = rawValue;
            if (rawValue.startsWith('base64-')) {
              jsonStr = Buffer.from(rawValue.replace('base64-', ''), 'base64').toString('utf-8');
            }
            
            const sessionData = JSON.parse(jsonStr);
            if (sessionData && sessionData.access_token) {
              token = sessionData.access_token;
              console.log(`[AuthMiddleware] Successfully extracted access_token from cookies.`);
            }
          } catch (parseError) {
            console.error(`[AuthMiddleware] Failed to parse Supabase cookie chunks:`, parseError);
          }
        }
      }

      if (!token) {
        console.debug(`[AuthMiddleware] Token missing. Origin: ${req.headers.origin}`);
        throw new AppError('Authentication token missing', 401, ErrorCode.UNAUTHORIZED);
      }

      // Verify JWT with Supabase Admin client directly using the token string.
      // Passing the token string explicitly forces Supabase to just verify the JWT
      // and fetch the user WITHOUT trying to refresh the session locally.
      const jwt = require('jsonwebtoken');
      const { env } = require('../config/env');
      
      let authUser;
      
      try {
         // Verify the JWT locally using the JWT secret to completely avoid network/refresh issues
         // This is the most bulletproof way to authenticate a stateless API request.
         const decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET || process.env.SUPABASE_JWT_SECRET || '');
         authUser = { id: decoded.sub };
         console.log(`[AuthMiddleware] JWT verified locally. User ID: ${authUser.id}`);
      } catch (jwtError: any) {
         console.error(`[AuthMiddleware] Local JWT verification failed:`, jwtError.message);
         // Fallback to Supabase API
         const { data, error } = await _supabase.auth.getUser(token);
         if (error || !data.user) {
            throw new AppError('Invalid or expired authentication token', 401, ErrorCode.UNAUTHORIZED);
         }
         authUser = data.user;
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
