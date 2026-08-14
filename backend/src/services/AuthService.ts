import { SupabaseClient } from '@supabase/supabase-js';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import { AuthAuditLogService } from './AuthAuditLogService';
import { authConfig } from '../config/auth';
import { User, UserStatus } from '../domain/entities/User';
import { AppError, ErrorCode } from '../utils/AppError';

import { env } from '../config/env';

export class AuthService {
  // Architectural Single-Flight & Deduplication Registry for OAuth authorization codes
  // Guarantees that exchangeCodeForSession(code) is executed EXACTLY ONCE per authorization code,
  // preventing double-consumption errors when Vercel CDN or browsers make duplicate callback requests.
  private static readonly codeExchangePromises = new Map<string, Promise<{ data: any; error: any }>>();
  private static readonly completedExchanges = new Map<string, { timestamp: number; result: any }>();

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userRepo: IUserRepository,
    private readonly auditLogger: AuthAuditLogService
  ) {}

  private createSSRClient(req?: any, res?: any) {
    const { createServerClient } = require('@supabase/ssr');
    
    // Official production @supabase/ssr implementation for Express
    const client = createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
        cookies: req && res ? {
          getAll() {
            const isDebugAuth = process.env.NODE_ENV !== 'production' && process.env.DEBUG_AUTH === 'true';
            if (isDebugAuth) {
              console.log('[Forensics] getAll() called. Cookie keys present:', Object.keys(req.cookies || {}));
            }
            return Object.keys(req.cookies || {}).map((name) => ({ name, value: req.cookies[name] }));
          },
          setAll(cookiesToSet: any[]) {
            const isDebugAuth = process.env.NODE_ENV !== 'production' && process.env.DEBUG_AUTH === 'true';
            if (isDebugAuth) {
              const safeCookies = cookiesToSet.map(c => ({ name: c.name, options: c.options }));
              console.log('[Forensics] setAll() called with cookie names:', JSON.stringify(safeCookies));
            }
            cookiesToSet.forEach(({ name, value, options }) => {
              const cookieOptions = { ...options };
              // Fix: @supabase/ssr passes maxAge in seconds (e.g. 600 for PKCE verifier),
              // but Express res.cookie requires maxAge in milliseconds.
              if (typeof cookieOptions.maxAge === 'number') {
                cookieOptions.maxAge = cookieOptions.maxAge * 1000;
              }
              if (env.NODE_ENV === 'production') {
                cookieOptions.secure = true;
                cookieOptions.sameSite = 'none'; // Force none for cross-site OAuth flow
              }
              if (isDebugAuth) {
                console.log(`[Forensics] Setting cookie: ${name} with options:`, JSON.stringify(cookieOptions));
              }
              res.cookie(name, value, cookieOptions);
            });
          }
        } : {
        getAll() { return []; },
        setAll() {}
      }
    });
    return client;
  }

  async validateUserStatus(userId: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
    }

    if (user.status === UserStatus.INACTIVE || user.status === UserStatus.DELETED) {
      throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
    }
    
    if (authConfig.features.emailVerificationRequired && user.status === UserStatus.PENDING_VERIFICATION) {
       // In a real app we might allow them to login but restrict actions, 
       // but here we can throw or just let them through and let RBAC block privileged actions.
       // For now we allow login, but they might need verification to book.
    }
  }

  async login(email: string, password: string, reqInfo: { ip: string, userAgent: string, requestId: string }) {
    if (!authConfig.features.passwordLoginEnabled) {
      throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
    }

    const { data, error } = await this.createSSRClient().auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      // Log failure
      await this.auditLogger.logAction({
        userId: null,
        action: 'Login Failure',
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
        requestId: reqInfo.requestId,
      });
      console.error('Supabase login error:', error);
      throw new AppError('Invalid email or password', 401, ErrorCode.VALIDATION_ERROR);
    }

    try {
      await this.validateUserStatus(data.user.id);
      
      await this.userRepo.update(data.user.id, { lastLoginAt: new Date() });

      await this.auditLogger.logAction({
        userId: data.user.id,
        action: 'Login Success',
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
        requestId: reqInfo.requestId,
      });

      return {
        user: data.user,
        session: data.session,
      };
    } catch (validationError) {
      // If validation fails, sign out the user from supabase immediately
      // Actually we don't need to sign out if we used a temp client, but it's safe to do so.
      await this.createSSRClient().auth.signOut();
      
      await this.auditLogger.logAction({
        userId: data.user.id,
        action: 'Login Failure (Validation)',
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
        requestId: reqInfo.requestId,
      });

      throw validationError;
    }
  }

  async logout(reqInfo: { userId: string, ip: string, userAgent: string, requestId: string }, req: any, res: any) {
    try {
      await this.createSSRClient(req, res).auth.signOut();
    } catch (signOutError) {
      console.warn('SSR signOut failed:', signOutError);
    }
    
    await this.auditLogger.logAction({
        userId: reqInfo.userId,
        action: 'Logout',
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
        requestId: reqInfo.requestId,
    });
  }

  async register(email: string, password: string, firstName: string, lastName: string, reqInfo: { ip: string, userAgent: string, requestId: string }) {
    if (!authConfig.features.emailRegistrationEnabled) {
      throw new AppError('Email registration is currently disabled', 400, ErrorCode.VALIDATION_ERROR);
    }

    if (password.length < authConfig.passwordPolicy.minLength) {
       throw new AppError(`Password must be at least ${authConfig.passwordPolicy.minLength} characters`, 400, ErrorCode.VALIDATION_ERROR);
    }

    // Use Admin API to create the user. This bypasses Supabase's email rate limits
    // and auto-confirms the email (no confirmation email sent).
    // The service role key is already used by our supabase client.
    const { data: createData, error: createError } = await this.supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: `${firstName} ${lastName}`,
      },
    });

    if (createError) {
      console.error('Supabase Admin createUser Error:', createError);
      // Provide user-friendly messages for common errors
      if (createError.message.includes('already been registered') || createError.message.includes('already exists')) {
        throw new AppError('An account with this email already exists', 409, ErrorCode.VALIDATION_ERROR);
      }
      throw new AppError(createError.message, 400, ErrorCode.VALIDATION_ERROR);
    }

    if (!createData.user) {
      throw new AppError('Failed to create user account', 500, ErrorCode.INTERNAL_SERVER_ERROR);
    }

    // Update the public.users record with first_name, last_name, and active status.
    // The trigger handle_new_user() already created the row, but we need to fill in details.
    try {
      await this.userRepo.update(createData.user.id, {
        firstName,
        lastName,
        status: UserStatus.ACTIVE,
      });
    } catch (updateError) {
      console.error('Error updating user profile after registration:', updateError);
      // Non-fatal: the user was created, just profile details are missing
    }

    // Now sign in immediately to get a session (access_token + refresh_token)
    const { data: signInData, error: signInError } = await this.createSSRClient().auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Supabase signIn after registration Error:', signInError);
      // User was created but sign-in failed. Still return success but without session.
      await this.auditLogger.logAction({
        userId: createData.user.id,
        action: 'Registration Success (Sign-in deferred)',
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
        requestId: reqInfo.requestId,
      });
      return { user: createData.user, session: null };
    }

    await this.auditLogger.logAction({
      userId: createData.user.id,
      action: 'Registration Success',
      ipAddress: reqInfo.ip,
      userAgent: reqInfo.userAgent,
      requestId: reqInfo.requestId,
    });

    return { user: signInData.user, session: signInData.session };
  }

  async getOAuthUrl(provider: 'google', redirectUrl: string, reqInfo: { ip: string, userAgent: string, requestId: string }, req: any, res: any) {
    if (provider === 'google' && !authConfig.features.googleLoginEnabled) {
      throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
    }

    const { data, error } = await this.createSSRClient(req, res).auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          prompt: 'select_account consent',
          access_type: 'offline',
        },
      }
    });

    if (error) { console.error('Supabase Error:', error); throw new AppError(error.message, 400, ErrorCode.VALIDATION_ERROR); }

    await this.auditLogger.logAction({
        userId: null, // We don't know the user yet
        action: `OAuth Init (${provider})`,
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
        requestId: reqInfo.requestId,
    });

    return data.url;
  }

  async exchangeCodeForSession(code: string, reqInfo: { ip: string, userAgent: string, requestId: string }, req: any, res: any) {
    console.log('[OAuth] Exchanging authorization code with single-flight deduplication');
    
    // 1. Check if this code was already successfully exchanged recently (within 60 seconds)
    const completed = AuthService.completedExchanges.get(code);
    if (completed && (Date.now() - completed.timestamp < 60000)) {
      console.log(`[OAuth Deduplication] Authorization code ${code.substring(0, 10)}... was already successfully exchanged within the last 60s. Returning cached session without re-invoking Supabase.`);
      return completed.result;
    }

    // 2. Check if an exchange is currently in-flight for this code (concurrent duplicate request from CDN/browser)
    let exchangePromise = AuthService.codeExchangePromises.get(code);
    if (!exchangePromise) {
      console.log(`[OAuth Deduplication] First invocation for code ${code.substring(0, 10)}... Initiating exact single execution of exchangeCodeForSession.`);
      exchangePromise = (async () => {
        try {
          const client = this.createSSRClient(req, res);
          const result = await client.auth.exchangeCodeForSession(code);
          
          if (result.error) {
            console.error('[OAuth] exchangeCodeForSession failed', {
              message: result.error.message,
              status: result.error.status,
            });
          } else {
            console.log('[OAuth] exchangeCodeForSession successful', {
              userId: result.data.user?.id,
              provider: result.data.user?.app_metadata?.provider,
              hasSession: Boolean(result.data.session)
            });
          }
          return result;
        } catch (err: any) {
          console.error('[OAuth] FATAL EXCEPTION during createSSRClient() or exchangeCodeForSession():');
          console.error(err.stack || err);
          throw err;
        } finally {
          AuthService.codeExchangePromises.delete(code);
        }
      })();
      AuthService.codeExchangePromises.set(code, exchangePromise);
    } else {
      console.log(`[OAuth Deduplication] Concurrent exchange already in-flight for code ${code.substring(0, 10)}... Waiting for initial execution result without calling Supabase again.`);
    }

    let data, error;
    try {
      const resData = await exchangePromise;
      data = resData.data;
      error = resData.error;
    } catch (err: any) {
      throw err;
    }

    if (error || !data?.user) {
      console.error('[AuthService] ERROR: Supabase code exchange error:', error);
      await this.auditLogger.logAction({
        userId: null,
        action: 'OAuth Callback Failure',
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
        requestId: reqInfo.requestId,
      });
      throw new AppError(error?.message || 'Failed to exchange authorization code', 400, ErrorCode.VALIDATION_ERROR);
    }

    try {
      console.log(`[AuthService] 4.2. Code exchanged successfully. Supabase User ID: ${data.user.id}`);
      console.log(`[AuthService] 4.3. Verifying public.users record...`);
      
      let user;
      try {
        user = await this.userRepo.findById(data.user.id);
      } catch (findErr: any) {
        console.error('[AuthService] ERROR finding user in public.users:');
        console.error(`Message: ${findErr.message}`);
        console.error(`Postgres Code: ${findErr.code || 'N/A'}`);
        console.error(`Stack: ${findErr.stack}`);
        throw findErr;
      }
      
      const nameParts = (data.user.user_metadata?.full_name || '').split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || '';
      const avatarUrl = data.user.user_metadata?.avatar_url || undefined;

      if (user) {
        console.log(`[AuthService] 4.4. User ${data.user.id} exists in local database. Performing profile update only...`);
        await this.validateUserStatus(data.user.id);
        
        const updatePayload: Partial<User> = { lastLoginAt: new Date() };
        if (!user.firstName && firstName !== 'User') updatePayload.firstName = firstName;
        if (!user.lastName && lastName !== '') updatePayload.lastName = lastName;
        if (!user.avatarUrl && avatarUrl) updatePayload.avatarUrl = avatarUrl;
        
        try {
          await this.userRepo.update(data.user.id, updatePayload);
          console.log(`[AuthService] 4.5. Existing user profile updated successfully.`);
        } catch (updateErr: any) {
          console.error('[AuthService] ERROR updating existing user profile:', updateErr.message || updateErr);
          throw updateErr;
        }
      } else {
        console.log(`[AuthService] 4.4. User ${data.user.id} not found locally. Performing idempotent INSERT using Supabase Auth UUID as Primary Key...`);
        console.log(`[AuthService] 4.5. Dynamically fetching Guest role ID using service-role client...`);
        const { data: roleData, error: roleError } = await this.supabase.from('roles').select('id').eq('name', 'Guest').single();
        if (roleError) {
           console.warn('[AuthService] WARNING: Failed to fetch Guest role ID:', roleError);
        }
        const roleId = roleData?.id || null;

        console.log(`[AuthService] 4.6. Inserting new user record into public.users...`);
        try {
          user = await this.userRepo.create({
            id: data.user.id,
            email: data.user.email || '',
            roleId, 
            status: UserStatus.ACTIVE,
            firstName,
            lastName,
            avatarUrl: avatarUrl || null,
          } as User);
          console.log(`[AuthService] 4.7. Successfully created user ${data.user.id} in public.users.`);
        } catch (createErr: any) {
          console.error('[AuthService] ERROR inserting user into public.users:');
          console.error(`Message: ${createErr.message}`);
          console.error(`Postgres Code: ${createErr.code || 'N/A'}`);
          console.error(`Stack: ${createErr.stack}`);
          throw createErr;
        }
      }

      console.log(`[AuthService] 4.8. Logging OAuth Success action...`);
      await this.auditLogger.logAction({
        userId: data.user.id,
        action: 'OAuth Callback Success',
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
        requestId: reqInfo.requestId,
      });

      console.log(`[AuthService] 4.9. Returning user and session data.`);
      const successfulResult = { user: data.user, session: data.session };
      AuthService.completedExchanges.set(code, { timestamp: Date.now(), result: successfulResult });
      AuthService.completedExchanges.forEach((val, key) => {
        if (Date.now() - val.timestamp > 60000) AuthService.completedExchanges.delete(key);
      });
      return successfulResult;
    } catch (dbError: any) {
      console.error('[AuthService] CRITICAL ERROR during OAuth user sync:', dbError.message || dbError);
      if (dbError.stack) console.error('[AuthService] Stack trace:', dbError.stack);
      
      try {
        await this.createSSRClient().auth.signOut();
      } catch (signOutErr) {
        console.error('[AuthService] Failed to sign out during error handling:', signOutErr);
      }
      
      await this.auditLogger.logAction({
        userId: data.user.id,
        action: 'OAuth Callback Failure (Sync/Validation)',
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
        requestId: reqInfo.requestId,
      });

      if (dbError instanceof AppError) throw dbError;
      throw new AppError(`Internal error during OAuth sync: ${dbError.message}`, 500, ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }
}
