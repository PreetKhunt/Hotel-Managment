import { SupabaseClient } from '@supabase/supabase-js';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import { AuthAuditLogService } from './AuthAuditLogService';
import { authConfig } from '../config/auth';
import { User, UserStatus } from '../domain/entities/User';
import { AppError, ErrorCode } from '../utils/AppError';

import { env } from '../config/env';

export class AuthService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userRepo: IUserRepository,
    private readonly auditLogger: AuthAuditLogService
  ) {}

  private createTempAuthClient(req?: any, res?: any) {
    const { createClient } = require('@supabase/supabase-js');
    
    // If req/res provided, use them for PKCE code verifier cookie storage
    const storage = req && res ? {
      getItem: (key: string) => req.cookies[key],
      setItem: (key: string, value: string) => res.cookie(key, value, { httpOnly: true, secure: true, sameSite: 'none' }),
      removeItem: (key: string) => res.clearCookie(key, { httpOnly: true, secure: true, sameSite: 'none' })
    } : undefined;

    return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { 
        persistSession: false, 
        autoRefreshToken: false,
        ...(storage ? { storage, flowType: 'pkce' } : {})
      }
    });
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

    const { data, error } = await this.createTempAuthClient().auth.signInWithPassword({
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
      await this.createTempAuthClient().auth.signOut();
      
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

  async logout(token: string, reqInfo: { userId: string, ip: string, userAgent: string, requestId: string }) {
    // Use admin.deleteUser's session invalidation or just clear the cookie server-side.
    // The service_role client doesn't have signOut, so we invalidate via admin API.
    try {
      // Attempt to sign out the user by invalidating their session via the admin API
      await this.supabase.auth.admin.signOut(token);
    } catch (signOutError) {
      // If admin signOut fails (e.g. method not available), just log it.
      // The cookie will be cleared on the response side regardless.
      console.warn('Admin signOut not available, clearing cookie only:', signOutError);
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
    const { data: signInData, error: signInError } = await this.createTempAuthClient().auth.signInWithPassword({
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

    const { data, error } = await this.createTempAuthClient(req, res).auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
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
    console.log('[AuthService] Attempting to exchange code with Supabase');
    const { data, error } = await this.createTempAuthClient(req, res).auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      console.error('[AuthService] Supabase code exchange error:', error);
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
      console.log(`[AuthService] Code exchanged successfully. User ID: ${data.user.id}. Verifying public.users record...`);
      
      let user = await this.userRepo.findById(data.user.id);
      
      if (!user) {
        console.log(`[AuthService] User ${data.user.id} not found in public.users. Creating automatically from OAuth data...`);
        const nameParts = (data.user.user_metadata?.full_name || '').split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Dynamically fetch the Guest role ID
        const { data: roleData } = await this.createTempAuthClient().from('roles').select('id').eq('name', 'Guest').single();
        const roleId = roleData?.id || null;

        user = await this.userRepo.create({
          id: data.user.id,
          email: data.user.email || '',
          roleId, 
          status: UserStatus.ACTIVE,
          firstName,
          lastName,
        } as User);
        
        console.log(`[AuthService] Successfully created user ${data.user.id} in public.users.`);
      } else {
        console.log(`[AuthService] User ${data.user.id} found in public.users. Updating lastLoginAt...`);
        await this.validateUserStatus(data.user.id);
        await this.userRepo.update(data.user.id, { lastLoginAt: new Date() });
      }

      await this.auditLogger.logAction({
        userId: data.user.id,
        action: 'OAuth Callback Success',
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
        requestId: reqInfo.requestId,
      });

      return { user: data.user, session: data.session };
    } catch (dbError: any) {
      console.error('[AuthService] Database error during OAuth user sync:', dbError.message || dbError);
      if (dbError.stack) console.error('[AuthService] Stack trace:', dbError.stack);
      
      // Don't need to sign out from global client
      await this.createTempAuthClient().auth.signOut();
      
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
