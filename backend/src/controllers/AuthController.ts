import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { authConfig } from '../config/auth';
import { AppError, ErrorCode } from '../utils/AppError';
import { env } from '../config/env';
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setSessionCookie(res: Response, sessionToken?: string) {
    if (sessionToken) {
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' as const : 'lax' as const,
        path: '/',
        maxAge: authConfig.session.timeoutMinutes * 60 * 1000,
      };
      const isDebugAuth = process.env.NODE_ENV !== 'production' && process.env.DEBUG_AUTH === 'true';
      if (isDebugAuth) {
        console.log(`\n========== [COOKIE FORENSICS] ==========`);
        console.log(`- Token exists?`, !!sessionToken);
        console.log(`- Token length:`, sessionToken.length);
        console.log(`- Cookie options:`, JSON.stringify(cookieOptions));
        
        // Exclude set-cookie headers to prevent token leak in logs
        const headersBefore = { ...res.getHeaders() };
        delete headersBefore['set-cookie'];
        console.log(`- Response headers BEFORE res.cookie():`, headersBefore);
      }
      
      res.cookie('hh_session', sessionToken, cookieOptions);
      
      if (isDebugAuth) {
        const headersAfter = { ...res.getHeaders() };
        delete headersAfter['set-cookie'];
        console.log(`- Response headers AFTER res.cookie():`, headersAfter);
        console.log(`==========================================\n`);
      }
    } else {
      console.log(`\n========== [COOKIE FORENSICS] ==========`);
      console.log(`WARNING: setSessionCookie called but sessionToken is missing/undefined!`);
      console.log(`==========================================\n`);
    }
  }

  private clearSessionCookie(res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('hh_session', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' as const : 'lax' as const,
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
      const isDebugAuth = process.env.NODE_ENV !== 'production' && process.env.DEBUG_AUTH === 'true';
      if (isDebugAuth) {
        console.error("\n========== [FORENSIC] BACKEND LOGOUT TRIGGERED ==========");
        console.log("[FORENSIC] Timestamp:", new Date().toISOString());
        console.log("[FORENSIC] Request ID (Correlation):", (req as any).id || 'unknown');
        console.log("[FORENSIC] Origin:", req.headers.origin);
        console.log("[FORENSIC] Referer:", req.headers.referer);
        console.log("[FORENSIC] User-Agent:", req.headers['user-agent']);
        console.log("[FORENSIC] Frontend Debug ID (X-Debug-Logout-ID):", req.headers['x-debug-logout-id'] || 'MISSING');
        console.log("[FORENSIC] Cookie keys:", Object.keys(req.cookies || {}));
        console.log("[FORENSIC] Authorization Header:", req.headers.authorization ? 'Present' : 'Missing');
        console.log("[FORENSIC] Request Body:", JSON.stringify(req.body));
        console.log("[FORENSIC] IP Address:", req.ip || req.connection.remoteAddress || 'unknown');
        console.log("[FORENSIC] Stack trace of execution at controller:", (new Error()).stack);
        console.log("=========================================================\n");
      }

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
      // Prevent all caching so Set-Cookie headers are always fresh
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');

      const isProduction = process.env.NODE_ENV === 'production';
      const nextParam = req.query.next as string || '/';
      
      // The redirectUrl MUST EXACTLY match the Supabase allowlist (no query params).
      const redirectUrl = env.GOOGLE_CALLBACK_URL;
      
      // Store 'next' destination in a cookie so the callback can redirect back correctly.
      res.cookie('oauth_next', nextParam, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 10 * 60 * 1000, // 10 minutes
      });
      
      console.log(`[OAuth] Generating Google OAuth URL...`);
      console.log(`[OAuth] redirectTo value configured EXACTLY as: ${redirectUrl}`);
      console.log(`[OAuth] Callback hostname: ${new URL(redirectUrl).hostname}`);
      console.log(`[OAuth] Request origin: ${req.headers.origin || 'none (direct navigation)'}`);

      const reqInfo = {
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: (req as any).id || 'unknown',
      };

      const url = await this.authService.getOAuthUrl('google', redirectUrl, reqInfo, req, res);
      
      // Verify which cookie names are now in the response headers (never log values).
      const setCookieHeader = res.getHeader('set-cookie');
      const setCookieArr: string[] = Array.isArray(setCookieHeader)
        ? (setCookieHeader as string[])
        : typeof setCookieHeader === 'string' ? [setCookieHeader] : [];
      const cookieNamesSent = setCookieArr.map(c => c.split('=')[0]).join(', ');
      const pkceInResponse = setCookieArr.some(c => c.includes('code-verifier'));
      console.log(`[OAuth] Cookie names being set in response: ${cookieNamesSent || 'NONE'}`);
      console.log(`[OAuth] PKCE code-verifier cookie present in response: ${pkceInResponse}`);

      // CRITICAL FIX: Use a 200 HTML response instead of HTTP 302.
      //
      // On Render (and some other PaaS platforms), the reverse proxy in front of the
      // service strips Set-Cookie headers from 302 redirect responses before they
      // reach the browser. This silently drops BOTH the PKCE verifier cookie and the
      // oauth_next cookie, causing "PKCE code verifier not found" at callback time.
      //
      // A 200 response is NEVER modified by proxies — cookies are guaranteed to reach
      // the browser and be stored before the JavaScript redirect fires.
      const safeUrl = JSON.stringify(url);
      const safeUrlAttr = url.replace(/"/g, '&quot;');
      console.log(`[OAuth] Sending 200 HTML redirect (proxy-safe) to Supabase OAuth URL`);
      res.status(200).type('html').send(
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=${safeUrlAttr}">
  <title>Signing in&hellip;</title>
  <style>
    body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;
         min-height:100vh;margin:0;background:#0A0F1E;color:#e2e8f0;flex-direction:column;gap:1rem}
    p{font-size:1rem;opacity:.7}
  </style>
</head>
<body>
  <p>Redirecting to Google&hellip;</p>
  <script>
    try { window.location.replace(${safeUrl}); }
    catch(e) { window.location.href = ${safeUrl}; }
  </script>
</body>
</html>`
      );
    } catch (error) {
      next(error);
    }
  };

  googleCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // CRITICAL: Prevent caching of the OAuth callback to ensure session cookie is always delivered
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      console.log('\n================ OAUTH CALLBACK START ================');
      console.log('[OAuth Callback] 1. Callback received. URL:', req.originalUrl);
      const code = req.query.code as string;
      
      // Always log PKCE cookie status in production to diagnose auth issues
      const allCookieKeys = Object.keys(req.cookies || {});
      const pkceCookieName = allCookieKeys.find(k => k.includes('sb-') && k.includes('-auth-token-code-verifier'));
      console.log(`[OAuth Callback] Callback hostname: ${req.hostname}`);
      console.log(`[OAuth Callback] Request origin: ${req.headers.origin || 'none (redirect navigation)'}`);
      console.log(`[OAuth Callback] Cookie keys received: [${allCookieKeys.join(', ')}]`);
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
        sameSite: 'lax',
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
      console.log(`[OAuth Callback] 5. exchangeCodeForSession finished successfully. Target nextUrl: ${nextUrl}`);
      if (session) {
          console.log('[OAuth Callback] 6. Valid session returned. Creating cookie...');
          try {
            this.setSessionCookie(res, session.access_token);
            console.log(`[OAuth] JWT created`);
            console.log(`[OAuth] Session created`);
            console.log(`[OAuth] Redirecting to frontend`);
          
          let validatedNextUrl = nextUrl;
          if (nextUrl.startsWith('http')) {
            try {
              const parsedUrl = new URL(nextUrl);
              if (parsedUrl.origin !== env.CORS_ORIGIN) {
                console.warn(`[OAuth Callback] WARNING: Untrusted nextUrl origin: ${parsedUrl.origin}. Falling back to /`);
                validatedNextUrl = '/';
              }
            } catch (e) {
              validatedNextUrl = '/';
            }
          }
          
          const finalRedirectUrl = validatedNextUrl.startsWith('http') ? validatedNextUrl : `${env.CORS_ORIGIN}${validatedNextUrl.startsWith('/') ? validatedNextUrl : '/' + validatedNextUrl}`;
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

      let validatedNextUrl = nextUrl;
      if (nextUrl.startsWith('http')) {
        try {
          const parsedUrl = new URL(nextUrl);
          if (parsedUrl.origin !== env.CORS_ORIGIN) {
            validatedNextUrl = '/';
          }
        } catch (e) {
          validatedNextUrl = '/';
        }
      }
      const finalRedirectUrl = validatedNextUrl.startsWith('http') ? validatedNextUrl : `${env.CORS_ORIGIN}${validatedNextUrl.startsWith('/') ? validatedNextUrl : '/' + validatedNextUrl}`;
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
