import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { authConfig } from '../config/auth';
import { AppError, ErrorCode } from '../utils/AppError';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setSessionCookie(res: Response, token: string) {
    res.cookie(authConfig.session.cookieName, token, {
      httpOnly: true,
      secure: authConfig.session.secureCookie,
      sameSite: 'lax',
      maxAge: authConfig.session.timeoutMinutes * 60 * 1000,
    });
  }

  private clearSessionCookie(res: Response) {
    res.clearCookie(authConfig.session.cookieName);
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
        userId: (req as any).user?.id || 'unknown',
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
      const redirectUrl = req.query.redirectUrl as string || 'http://localhost:3000/auth/callback';
      
      const reqInfo = {
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: (req as any).id || 'unknown',
      };

      const url = await this.authService.getOAuthUrl('google', redirectUrl, reqInfo);
      
      res.redirect(url);
    } catch (error) {
      next(error);
    }
  };

  googleCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = req.query.code as string;
      const nextUrl = req.query.next as string || '/';

      if (!code) {
        throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
      }

      const reqInfo = {
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: (req as any).id || 'unknown',
      };

      const { session } = await this.authService.exchangeCodeForSession(code, reqInfo);
      
      if (session) {
        this.setSessionCookie(res, session.access_token);
      }

      // Normally we would redirect to the frontend with success, 
      // but since it's an API, we can either redirect or just return JSON based on what the client expects.
      // Usually, the frontend completes the PKCE flow directly. If it hits our backend callback, we redirect.
      res.redirect(nextUrl);
    } catch (error) {
      next(error);
    }
  };
}
