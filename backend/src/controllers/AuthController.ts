import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { authConfig } from '../config/auth';
import { AppError, ErrorCode } from '../utils/AppError';
import { env } from '../config/env';
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setSessionCookie(res: Response, token: string) {
    console.log('[Auth] setSessionCookie executing...');
    console.log(`[Auth] NODE_ENV is: ${process.env.NODE_ENV}`);
    console.log(`[Auth] Access token exists: ${!!token} (length: ${token?.length || 0})`);
    
    const cookieOptions = {
      httpOnly: true,
      secure: true, // Always true for cross-origin Netlify <-> Railway
      sameSite: 'none' as const, // Always 'none' to allow cross-origin requests
      path: '/',
      maxAge: authConfig.session.timeoutMinutes * 60 * 1000,
      // Intentionally NOT setting Domain attribute so it acts as a host-only cookie
    };
    
    console.log(`[Auth] Cookie name: ${authConfig.session.cookieName}`);
    console.log(`[Auth] Cookie options:`, JSON.stringify(cookieOptions));
    
    res.cookie(authConfig.session.cookieName, token, cookieOptions);
    console.log('[Auth] Set-Cookie header attached to response');
  }

  private clearSessionCookie(res: Response) {
    res.clearCookie(authConfig.session.cookieName, {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
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
      const redirectUrl = `${env.GOOGLE_CALLBACK_URL}?next=${encodeURIComponent(nextParam)}`;
      
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
    console.log('\n================ OAUTH CALLBACK START ================');
    console.log('[OAuth Callback] 1. Callback entered. URL:', req.originalUrl);
    try {
      const code = req.query.code as string;
      const nextUrl = req.query.next as string || '/';
      
      console.log(`[OAuth Callback] 2. Authorization code received: ${!!code ? 'YES (length: ' + code.length + ')' : 'NO'}`);
      console.log(`[OAuth Callback] 3. Target next URL: ${nextUrl}`);

      if (!code) {
        console.error('[OAuth Callback] ERROR: Missing authorization code');
        throw new AppError('Missing authorization code', 400, ErrorCode.VALIDATION_ERROR);
      }

      const reqInfo = {
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: (req as any).id || 'unknown',
      };

      console.log('[OAuth Callback] 4. Starting exchangeCodeForSession...');
      
      let sessionData;
      try {
        sessionData = await this.authService.exchangeCodeForSession(code, reqInfo, req, res);
      } catch (exchangeError: any) {
        console.error('[OAuth Callback] ERROR during exchangeCodeForSession:');
        console.error(exchangeError.stack || exchangeError);
        throw exchangeError; // Rethrow to outer catch
      }

      const { session } = sessionData;
      console.log('[OAuth Callback] 5. exchangeCodeForSession finished successfully.');
      
      if (session) {
        console.log('[OAuth Callback] 6. Valid session returned. Creating cookie...');
        try {
          this.setSessionCookie(res, session.access_token);
          console.log('[OAuth Callback] 7. Cookie created successfully.');
        } catch (cookieErr: any) {
          console.error('[OAuth Callback] ERROR creating session cookie:', cookieErr.message);
          console.error(cookieErr.stack);
          throw cookieErr;
        }
      } else {
        console.warn('[OAuth Callback] WARNING: No session returned from code exchange.');
      }

      const finalRedirectUrl = nextUrl.startsWith('http') ? nextUrl : `${env.CORS_ORIGIN}${nextUrl}`;
      console.log(`[OAuth Callback] 8. Redirecting to frontend: ${finalRedirectUrl}`);
      console.log('================ OAUTH CALLBACK END ================\n');
      res.redirect(finalRedirectUrl);
    } catch (error: any) {
      console.error('\n================ OAUTH CALLBACK FATAL ERROR ================');
      console.error('Error Message:', error.message || error);
      console.error('Stack Trace:');
      console.error(error.stack);
      console.error('============================================================\n');
      
      // Ensure the error reaches the Express global error handler
      next(error);
    }
  };
}
