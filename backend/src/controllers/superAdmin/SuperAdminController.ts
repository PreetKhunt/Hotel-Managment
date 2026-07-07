import { Request, Response, NextFunction } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { AppError, ErrorCode } from '../../utils/AppError';
import { AdminAuditLogService } from '../../services/superAdmin/AdminAuditLogService';

export class SuperAdminController {
  constructor(
    private supabase: SupabaseClient,
    private auditLogService: AdminAuditLogService
  ) {}

  // ================= ROOMS =================
  getRooms = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, error } = await this.supabase
        .from('rooms')
        .select(`
          *,
          room_images (id, image_url, display_order, is_featured)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  };

  createRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, error } = await this.supabase.from('rooms').insert([req.body]).select().single();
      if (error) throw error;

      await this.auditLogService.logAction(
        req.user!.id, req.user!.roleName, 'CREATE', 'room', data.id, null, data, req.id, req.ip || ''
      );
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  };

  updateRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { data: before } = await this.supabase.from('rooms').select('*').eq('id', id).single();
      
      const { data, error } = await this.supabase.from('rooms').update(req.body).eq('id', id).select().single();
      if (error) throw error;

      await this.auditLogService.logAction(
        req.user!.id, req.user!.roleName, 'UPDATE', 'room', id, before, data, req.id, req.ip || ''
      );
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  };

  deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { data: before } = await this.supabase.from('rooms').select('*').eq('id', id).single();

      const { error } = await this.supabase.from('rooms').delete().eq('id', id);
      if (error) throw error;

      await this.auditLogService.logAction(
        req.user!.id, req.user!.roleName, 'DELETE', 'room', id, before, null, req.id, req.ip || ''
      );
      res.status(200).json({ success: true, message: 'Room deleted' });
    } catch (error) { next(error); }
  };

  // ================= USERS =================
  getUsers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, error } = await this.supabase.from('users').select(`*, roles (name)`);
      if (error) throw error;
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { roleId, status } = req.body;
      
      const { data: before } = await this.supabase.from('users').select('*, roles(name)').eq('id', id).single();
      if (before?.roles?.name === 'Super Admin' && (status === 'deleted' || status === 'suspended')) {
         // Check if this is the last Super Admin before allowing suspension
         const { count } = await this.supabase.from('users').select('id', { count: 'exact' }).eq('role_id', before.role_id).eq('status', 'active');
         if (count === 1) {
            throw new AppError('Cannot suspend or delete the last active Super Admin', 400, ErrorCode.VALIDATION_ERROR);
         }
      }

      const updates: any = {};
      if (roleId) updates.role_id = roleId;
      if (status) {
         updates.status = status;
         if (status === 'deleted') {
            updates.deleted_at = new Date().toISOString();
            updates.deleted_by = req.user!.id;
         }
      }

      const { data, error } = await this.supabase.from('users').update(updates).eq('id', id).select().single();
      if (error) throw error;

      await this.auditLogService.logAction(
        req.user!.id, req.user!.roleName, 'UPDATE', 'user', id, before, data, req.id, req.ip || ''
      );
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  };

  // ================= BOOKINGS =================
  getBookings = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, error } = await this.supabase.from('bookings').select(`*, users (first_name, last_name, email), rooms(name, room_type)`);
      if (error) throw error;
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  };

  updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const { data: before } = await this.supabase.from('bookings').select('*').eq('id', id).single();
      const { data, error } = await this.supabase.from('bookings').update({ status }).eq('id', id).select().single();
      if (error) throw error;

      await this.auditLogService.logAction(
        req.user!.id, req.user!.roleName, 'UPDATE_STATUS', 'booking', id, before, data, req.id, req.ip || ''
      );
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  };

  // ================= REVIEWS =================
  getReviews = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, error } = await this.supabase.from('reviews').select(`*, users(first_name, last_name), rooms(name)`);
      if (error) throw error;
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  };

  updateReviewStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { is_visible } = req.body;
      // assuming a visibility column. If not exists, we use status
      const { data: before } = await this.supabase.from('reviews').select('*').eq('id', id).single();
      const { data, error } = await this.supabase.from('reviews').update({ status: is_visible ? 'published' : 'hidden' }).eq('id', id).select().single();
      if (error) throw error;

      await this.auditLogService.logAction(
        req.user!.id, req.user!.roleName, 'UPDATE_STATUS', 'review', id, before, data, req.id, req.ip || ''
      );
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  };

  // ================= SETTINGS =================
  getSettings = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, error } = await this.supabase.from('hotel_settings').select('*').limit(1).single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data: before } = await this.supabase.from('hotel_settings').select('*').limit(1).single();
      
      let data, error;
      if (!before) {
        ({ data, error } = await this.supabase.from('hotel_settings').insert([req.body]).select().single());
      } else {
        ({ data, error } = await this.supabase.from('hotel_settings').update(req.body).eq('id', before.id).select().single());
      }
      
      if (error) throw error;

      await this.auditLogService.logAction(
        req.user!.id, req.user!.roleName, 'UPDATE', 'settings', data.id, before, data, req.id, req.ip || ''
      );
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  };

  // ================= LOGS =================
  getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const result = await this.auditLogService.getLogs(page);
      res.status(200).json({ success: true, data: result.data, count: result.count });
    } catch (error) { next(error); }
  };
}
