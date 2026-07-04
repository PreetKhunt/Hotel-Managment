import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { authConfig } from '../config/auth';
import { AppError, ErrorCode } from '../utils/AppError';
import { env } from '../config/env';
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setSessionCookie(res: Response, token: string) {
    res.cookie(authConfig.session.cookieName, token, {
      httpOnly: true,
      secure: authConfig.session.secureCookie,
      sameSite: authConfig.session.secureCookie ? 'none' : 'lax',
      path: '/',
      maxAge: authConfig.session.timeoutMinutes * 60 * 1000,
    });
  }

  private clearSessionCookie(res: Response) {
    res.clearCookie(authConfig.session.cookieName, {
      httpOnly: true,
      secure: authConfig.session.secureCookie,
      sameSite: authConfig.session.secureCookie ? 'none' : 'lax',
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
        requestId: (req as any).id || 'unknown', // Assuming request tracing middleware adds id
      };

      const { user, session } = await this.authService.login(email, password, reqInfo);
      
      if (session) {
        this.setSessionCookie(res, session.access_token);
      }

      res.status(200).json({
        status: 'success',
        data: {
          user,
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
      const token = req.cookies[authConfig.session.cookieName] || req.headers.authorization?.split(' ')[1];
      
      const reqInfo = {
        userId: (req as any).user?.id || null,
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: (req as any).id || 'unknown',
      };

      if (token) {
         await this.authService.logout(token, reqInfo);
      }
      
      this.clearSessionCookie(res);

      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  googleOAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nextParam = req.query.next as string || '/';
      const redirectUrl = `${env.CORS_ORIGIN}/api/v1/auth/callback?next=${encodeURIComponent(nextParam)}`;
      
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
    console.log('[OAuth Callback] Received request:', req.originalUrl);
    try {
      const code = req.query.code as string;
      const nextUrl = req.query.next as string || '/';
      
      console.log(`[OAuth Callback] Code present: ${!!code}, Next URL: ${nextUrl}`);

      if (!code) {
        console.error('[OAuth Callback] Missing authorization code');
        throw new AppError('Missing authorization code', 400, ErrorCode.VALIDATION_ERROR);
      }

      const reqInfo = {
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: (req as any).id || 'unknown',
      };

      console.log('[OAuth Callback] Attempting to exchange code for session...');
      const { session } = await this.authService.exchangeCodeForSession(code, reqInfo, req, res);
      console.log('[OAuth Callback] Code exchange successful. Session retrieved.');
      
      if (session) {
        console.log('[OAuth Callback] Setting session cookie...');
        this.setSessionCookie(res, session.access_token);
        console.log('[OAuth Callback] Session cookie set successfully.');
      } else {
        console.warn('[OAuth Callback] No session returned from code exchange.');
      }

      console.log(`[OAuth Callback] Redirecting to frontend: ${nextUrl}`);
      res.redirect(nextUrl);
    } catch (error: any) {
      console.error('[OAuth Callback] CRITICAL ERROR:', error.message || error);
      if (error.stack) {
        console.error('[OAuth Callback] Stack trace:', error.stack);
      }
      next(error);
    }
  };
}
