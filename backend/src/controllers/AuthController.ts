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
        sameSite: 'none' as const,
        path: '/',
        maxAge: authConfig.session.timeoutMinutes * 60 * 1000,
      };
      console.log(`[AuthController] setSessionCookie executing. Cookie name: hh_session, Options:`, JSON.stringify(cookieOptions));
      res.cookie('hh_session', sessionToken, cookieOptions);
      console.log(`[AuthController] Exact Set-Cookie header generated:`, res.getHeader('set-cookie'));
    }
  }

  private clearSessionCookie(res: Response) {
    res.clearCookie('hh_session', {
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
        this.setSessionCookie(res);
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
        this.setSessionCookie(res);
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
      // and redirects to the Site URL (Netlify) instead of Railway!
      const redirectUrl = env.GOOGLE_CALLBACK_URL;
      
      // Store 'next' in a secure cookie to read it during the callback
      res.cookie('oauth_next', nextParam, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 10 * 60 * 1000, // 10 minutes
      });
      
      console.log(`[OAuth] Generating Google OAuth URL...`);
      console.log(`[OAuth] redirectTo value configured EXACTLY as: ${redirectUrl}`);

      const reqInfo = {
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: (req as any).id || 'unknown',
      };

      const url = await this.authService.getOAuthUrl('google', redirectUrl, reqInfo, req, res);
      
      console.log(`[OAuth] Generated OAuth URL: ${url}`);
      console.log(`[OAuth] PKCE cookie should now be set on the response (handled by @supabase/ssr setAll)`);
      console.log(`[OAuth] Cookie sent to browser`);
      res.redirect(url);
    } catch (error) {
      next(error);
    }
  };

  googleCallback = async (req: Request, res: Response, next: NextFunction) => {
    console.log('\n================ OAUTH CALLBACK START ================');
    console.log('[OAuth Callback] 1. Callback received. URL:', req.originalUrl);
    try {
      const code = req.query.code as string;
      
      console.log(`[OAuth Callback] Cookies received:`, JSON.stringify(req.cookies, null, 2));
      const pkceCookieName = Object.keys(req.cookies).find(k => k.includes('sb-') && k.includes('-auth-token-code-verifier'));
      if (pkceCookieName) {
         console.log(`[OAuth Callback] PKCE cookie found: ${pkceCookieName}`);
      } else {
         console.log(`[OAuth Callback] WARNING: No PKCE cookie found in req.cookies!`);
      }

      // Read nextUrl from the secure cookie we set before redirecting
      const nextUrl = req.cookies.oauth_next || '/';
      res.clearCookie('oauth_next', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
      });
      
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
            console.log(`[OAuth] JWT created`);
            console.log(`[OAuth] Session created`);
            console.log(`[OAuth] Redirecting to frontend`);
            const finalRedirectUrl = nextUrl.startsWith('http') ? nextUrl : `${env.CORS_ORIGIN}${nextUrl}`;
            res.redirect(finalRedirectUrl);
            return; // Prevent duplicate redirect execution
          } catch (cookieErr: any) {
            console.error('[OAuth Callback] ERROR creating session cookie:', cookieErr.message);
            console.error(cookieErr.stack);
            throw cookieErr;
          }
        } else {
          console.warn('[OAuth Callback] WARNING: No session returned from code exchange.');
        }
  
        const finalRedirectUrl = nextUrl.startsWith('http') ? nextUrl : `${env.CORS_ORIGIN}${nextUrl}`;
        console.log(`[OAuth Callback] 8. Redirecting to frontend (No Session): ${finalRedirectUrl}`);
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
