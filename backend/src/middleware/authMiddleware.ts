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
  supabase: SupabaseClient,
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
        throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
      }

      // Verify JWT with Supabase
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

      if (error || !authUser) {
        throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
      }

      // Fetch user details from public schema
      const dbUser = await userRepo.findById(authUser.id);
      
      if (!dbUser) {
        throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
      }

      if (dbUser.status === UserStatus.SUSPENDED || dbUser.status === UserStatus.DELETED || dbUser.status === UserStatus.INACTIVE) {
        throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
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
        throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
      }

      if (req.user.permissions.includes('full_access') || req.user.permissions.includes(permission)) {
        return next();
      }

      throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
    } catch (error) {
      next(error);
    }
  };
};
