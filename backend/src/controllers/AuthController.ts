import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { authConfig } from '../config/auth';
import { AppError, ErrorCode } from '../utils/AppError';
import { env } from '../config/env';
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setSessionCookie(res: Response, sessionToken?: string) {
    if (sessionToken) {
      const cookieOptions = {
        httpOnly: true,
        secure: true, // true for production
        sameSite: 'lax' as const,
        path: '/',
        maxAge: authConfig.session.timeoutMinutes * 60 * 1000,
      };
      res.cookie('hh_session', sessionToken, cookieOptions);
    }
  }

  private clearSessionCookie(res: Response) {
    res.clearCookie('hh_session', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      path: '/',
    });
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
      }

      const reqInfo = {
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: (req as any).id || 'unknown',
      };

      const { user: authUser, session } = await this.authService.login(email, password, reqInfo);
      
      if (session) {
        this.setSessionCookie(res, session.access_token);
      }

      // Fetch complete profile with role
      const userRepo = (this.authService as any).userRepo;
      const dbUser = await userRepo.findById(authUser.id);
      
      let roleName = 'Guest';
      let permissions: string[] = [];
      if (dbUser?.roleId) {
        // Find role dynamically using the correct config path
        const { RoleRepository } = require('../domain/repositories/postgres/RoleRepository');
        const { pgPool } = require('../config/database');
        const tempRoleRepo = new RoleRepository(pgPool);
        const role = await tempRoleRepo.findById(dbUser.roleId);
        if (role) {
          roleName = role.name;
          const perms = await tempRoleRepo.getPermissionsForRole(role.id);
          permissions = perms.map((p: any) => p.name);
        }
      }

      const fullUser = {
        ...(dbUser || authUser),
        role: {
          name: roleName,
          permissions: permissions
        }
      };

      res.status(200).json({
        status: 'success',
        data: {
          user: fullUser,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password || !firstName || !lastName) {
        throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
      }

      const reqInfo = {
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: (req as any).id || 'unknown',
      };

      const { user, session } = await this.authService.register(email, password, firstName, lastName, reqInfo);

      if (session) {
        this.setSessionCookie(res, session.access_token);
      }

      res.status(201).json({
        status: 'success',
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.error("\n========== [FORENSIC] BACKEND LOGOUT TRIGGERED ==========");
      console.log("[FORENSIC] Timestamp:", new Date().toISOString());
      console.log("[FORENSIC] Request ID (Correlation):", (req as any).id || 'unknown');
      console.log("[FORENSIC] Origin:", req.headers.origin);
      console.log("[FORENSIC] Referer:", req.headers.referer);
      console.log("[FORENSIC] User-Agent:", req.headers['user-agent']);
      console.log("[FORENSIC] Frontend Debug ID (X-Debug-Logout-ID):", req.headers['x-debug-logout-id'] || 'MISSING');
      console.log("[FORENSIC] Cookies (raw):", req.headers.cookie);
      console.log("[FORENSIC] Cookies (parsed):", req.cookies);
      console.log("[FORENSIC] Authorization Header:", req.headers.authorization ? 'Present' : 'Missing');
      console.log("[FORENSIC] Request Body:", JSON.stringify(req.body));
      console.log("[FORENSIC] IP Address:", req.ip || req.connection.remoteAddress || 'unknown');
      console.log("[FORENSIC] Stack trace of execution at controller:", (new Error()).stack);
      console.log("=========================================================\n");

      const reqInfo = {
        userId: (req as any).user?.id || null,
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: (req as any).id || 'unknown',
      };

      console.log("[FORENSIC] Calling authService.logout...");
      await this.authService.logout(reqInfo, req, res);
      
      console.log("[FORENSIC] Calling clearSessionCookie...");
      this.clearSessionCookie(res);

      res.setHeader('X-Logout-Source', 'backend-auth-controller');
      res.setHeader('X-Logout-Timestamp', Date.now().toString());

      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error("[FORENSIC] Error during logout:", error);
      next(error);
    }
  };

  googleOAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nextParam = req.query.next as string || '/';
      
      // Fix: The redirectUrl MUST EXACTLY match the Supabase whitelist.
      // Do NOT append query parameters like ?next=... here, otherwise Supabase silently rejects it
      // and redirects to the Site URL (Vercel) instead of Render!
      const redirectUrl = env.GOOGLE_CALLBACK_URL;
      
      // Store 'next' in a secure cookie to read it during the callback
      res.cookie('oauth_next', nextParam, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 10 * 60 * 1000, // 10 minutes
      });
      
      const reqInfo = {
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: (req as any).id || 'unknown',
      };

      const url = await this.authService.getOAuthUrl('google', redirectUrl, reqInfo, req, res);
      res.redirect(url);
    } catch (error) {
      next(error);
    }
  };

  googleCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = req.query.code as string;
      const nextUrl = req.cookies.oauth_next || '/';
      
      res.clearCookie('oauth_next', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
      });

      if (!code) {
        throw new AppError('Missing authorization code', 400, ErrorCode.VALIDATION_ERROR);
      }

      const reqInfo = {
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: (req as any).id || 'unknown',
      };

      const { session } = await this.authService.exchangeCodeForSession(code, reqInfo, req, res);

      if (session) {
        this.setSessionCookie(res, session.access_token);
      }

      const finalRedirectUrl = nextUrl.startsWith('http') ? nextUrl : `${env.CORS_ORIGIN}${nextUrl}`;
      res.redirect(finalRedirectUrl);
    } catch (error) {
      next(error);
    }
  };
}
