import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger';

const FALLBACK_SQL_012 = `
-- 1. Safely Expand room status constraint without losing production data
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_status_check;
ALTER TABLE rooms ADD CONSTRAINT rooms_status_check 
  CHECK (LOWER(status) IN ('available', 'occupied', 'maintenance', 'clean', 'dirty', 'under cleaning', 'reserved'));

-- 2. Ensure standard Operational Roles exist in the system
INSERT INTO roles (id, name, description) VALUES 
  (uuid_generate_v4(), 'Housekeeping', 'Housekeeping staff responsible for room cleanliness and inspection'),
  (uuid_generate_v4(), 'Technician', 'Maintenance technician responsible for asset repairs and utilities'),
  (uuid_generate_v4(), 'Reception', 'Front desk and concierge operations management'),
  (uuid_generate_v4(), 'Staff', 'General hospital internal staff member')
ON CONFLICT (name) DO NOTHING;

-- 3. Create System Notifications Table for role-aware persistent alerts
CREATE TABLE IF NOT EXISTS system_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE NULL,
  role_target VARCHAR(50) NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(50) DEFAULT 'Info' CHECK (priority IN ('Info', 'Warning', 'Critical')),
  is_read BOOLEAN DEFAULT false,
  link VARCHAR(255) NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_sys_notif_recipient ON system_notifications(recipient_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sys_notif_role ON system_notifications(role_target) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sys_notif_read ON system_notifications(is_read) WHERE deleted_at IS NULL;

-- 4. Create Housekeeping Tasks Table
CREATE TABLE IF NOT EXISTS housekeeping_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'In Progress', 'Completed', 'Verified', 'Cancelled')),
  priority VARCHAR(50) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Emergency')),
  remarks TEXT NULL,
  version INTEGER DEFAULT 1 NOT NULL,
  started_at TIMESTAMPTZ NULL,
  completed_at TIMESTAMPTZ NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  deleted_by UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_hk_tasks_room ON housekeeping_tasks(room_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hk_tasks_assigned_to ON housekeeping_tasks(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hk_tasks_status ON housekeeping_tasks(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hk_tasks_priority ON housekeeping_tasks(priority) WHERE deleted_at IS NULL;

-- 5. Create Cleaning History Table (Housekeeping Audit & Analytics)
CREATE TABLE IF NOT EXISTS cleaning_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES housekeeping_tasks(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  time_taken_minutes INTEGER DEFAULT 0 NOT NULL,
  remarks TEXT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_clean_hist_room ON cleaning_history(room_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clean_hist_completed_by ON cleaning_history(completed_by) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clean_hist_completed_at ON cleaning_history(completed_at) WHERE deleted_at IS NULL;

-- 6. Create Maintenance Requests Table
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  issue_type VARCHAR(100) NOT NULL CHECK (issue_type IN ('Electrical', 'Plumbing', 'Furniture', 'Internet', 'AC', 'TV', 'Bathroom', 'Door Lock', 'Water', 'Other')),
  description TEXT NOT NULL,
  priority VARCHAR(50) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Emergency')),
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Reported', 'Assigned', 'In Progress', 'On Hold', 'Completed', 'Verified', 'Cancelled')),
  estimated_cost NUMERIC(10, 2) DEFAULT 0.00,
  actual_cost NUMERIC(10, 2) DEFAULT 0.00,
  version INTEGER DEFAULT 1 NOT NULL,
  started_at TIMESTAMPTZ NULL,
  completed_at TIMESTAMPTZ NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  deleted_by UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_maint_req_room ON maintenance_requests(room_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_maint_req_reported_by ON maintenance_requests(reported_by) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_maint_req_assigned_to ON maintenance_requests(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_maint_req_status ON maintenance_requests(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_maint_req_priority ON maintenance_requests(priority) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_maint_req_issue_type ON maintenance_requests(issue_type) WHERE deleted_at IS NULL;

-- 7. Create Maintenance Audit Logs Table
CREATE TABLE IF NOT EXISTS maintenance_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES maintenance_requests(id) ON DELETE CASCADE NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NULL,
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  assigned_technician_id UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  performed_by UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  action VARCHAR(100) NOT NULL,
  old_value JSONB NULL,
  new_value JSONB NULL,
  ip_address VARCHAR(45) NULL,
  correlation_id VARCHAR(100) NULL,
  repair_time_minutes INTEGER NULL,
  repair_cost NUMERIC(10, 2) NULL,
  remarks TEXT NULL,
  completion_time TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_maint_audit_req ON maintenance_audit_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_maint_audit_tech ON maintenance_audit_logs(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_maint_audit_created ON maintenance_audit_logs(created_at);

-- 8. Auto-update Timestamp Triggers
DROP TRIGGER IF EXISTS update_sys_notif_modtime ON system_notifications;
CREATE TRIGGER update_sys_notif_modtime
  BEFORE UPDATE ON system_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_housekeeping_tasks_modtime ON housekeeping_tasks;
CREATE TRIGGER update_housekeeping_tasks_modtime
  BEFORE UPDATE ON housekeeping_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cleaning_history_modtime ON cleaning_history;
CREATE TRIGGER update_cleaning_history_modtime
  BEFORE UPDATE ON cleaning_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_requests_modtime ON maintenance_requests;
CREATE TRIGGER update_maintenance_requests_modtime
  BEFORE UPDATE ON maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Enable Row Level Security (RLS) and Create Service Access Policies
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE housekeeping_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated access to system_notifications" ON system_notifications;
CREATE POLICY "Allow authenticated access to system_notifications" ON system_notifications FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow authenticated access to housekeeping_tasks" ON housekeeping_tasks;
CREATE POLICY "Allow authenticated access to housekeeping_tasks" ON housekeeping_tasks FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow authenticated access to cleaning_history" ON cleaning_history;
CREATE POLICY "Allow authenticated access to cleaning_history" ON cleaning_history FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow authenticated access to maintenance_requests" ON maintenance_requests;
CREATE POLICY "Allow authenticated access to maintenance_requests" ON maintenance_requests FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow authenticated access to maintenance_audit_logs" ON maintenance_audit_logs;
CREATE POLICY "Allow authenticated access to maintenance_audit_logs" ON maintenance_audit_logs FOR ALL USING (true) WITH CHECK (true);
`;

const FALLBACK_SQL_017 = `
-- Helper functions
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.name = 'Super Admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_super()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.name IN ('Admin', 'Super Admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_hotel_staff()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.name IN ('Admin', 'Super Admin', 'Manager', 'Receptionist', 'Reception')
  );
$$;

-- Idempotent Super Admin assignment
DO $$ 
DECLARE
    super_admin_role_id UUID;
BEGIN
    SELECT id INTO super_admin_role_id FROM public.roles WHERE name = 'Super Admin' LIMIT 1;
    IF super_admin_role_id IS NOT NULL THEN
        UPDATE public.users 
        SET role_id = super_admin_role_id, status = 'active'
        WHERE LOWER(email) IN ('khuntpreet12@gmail.com', 'kenilbaldaniya510@gmail.com');
    END IF;
END $$;

-- Enable RLS and define policies on all 13 reported tables
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hotels_public_read" ON public.hotels;
CREATE POLICY "hotels_public_read" ON public.hotels FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "hotels_admin_manage" ON public.hotels;
CREATE POLICY "hotels_admin_manage" ON public.hotels FOR ALL TO authenticated USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());

ALTER TABLE public.hotel_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hotel_settings_staff_read" ON public.hotel_settings;
CREATE POLICY "hotel_settings_staff_read" ON public.hotel_settings FOR SELECT TO authenticated USING (public.is_hotel_staff());
DROP POLICY IF EXISTS "hotel_settings_admin_manage" ON public.hotel_settings;
CREATE POLICY "hotel_settings_admin_manage" ON public.hotel_settings FOR ALL TO authenticated USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());

ALTER TABLE public.room_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "room_images_public_read" ON public.room_images;
CREATE POLICY "room_images_public_read" ON public.room_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "room_images_admin_manage" ON public.room_images;
CREATE POLICY "room_images_admin_manage" ON public.room_images FOR ALL TO authenticated USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());

ALTER TABLE public.hotel_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hotel_images_public_read" ON public.hotel_images;
CREATE POLICY "hotel_images_public_read" ON public.hotel_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "hotel_images_admin_manage" ON public.hotel_images;
CREATE POLICY "hotel_images_admin_manage" ON public.hotel_images FOR ALL TO authenticated USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invoices_owner_read" ON public.invoices;
CREATE POLICY "invoices_owner_read" ON public.invoices FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = invoices.booking_id AND b.user_id = auth.uid()));
DROP POLICY IF EXISTS "invoices_staff_read" ON public.invoices;
CREATE POLICY "invoices_staff_read" ON public.invoices FOR SELECT TO authenticated USING (public.is_hotel_staff());
DROP POLICY IF EXISTS "invoices_admin_manage" ON public.invoices;
CREATE POLICY "invoices_admin_manage" ON public.invoices FOR ALL TO authenticated USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_settings_owner_read" ON public.user_settings;
CREATE POLICY "user_settings_owner_read" ON public.user_settings FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "user_settings_owner_modify" ON public.user_settings;
CREATE POLICY "user_settings_owner_modify" ON public.user_settings FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "user_settings_admin_read" ON public.user_settings;
CREATE POLICY "user_settings_admin_read" ON public.user_settings FOR SELECT TO authenticated USING (public.is_admin_or_super());

ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.booking_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "booking_audit_logs_staff_read" ON public.booking_audit_logs;
CREATE POLICY "booking_audit_logs_staff_read" ON public.booking_audit_logs FOR SELECT TO authenticated USING (public.is_hotel_staff());

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_audit_logs_super_read" ON public.admin_audit_logs;
CREATE POLICY "admin_audit_logs_super_read" ON public.admin_audit_logs FOR SELECT TO authenticated USING (public.is_super_admin());

ALTER TABLE public.auth_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_audit_logs_admin_read" ON public.auth_audit_logs;
CREATE POLICY "auth_audit_logs_admin_read" ON public.auth_audit_logs FOR SELECT TO authenticated USING (public.is_admin_or_super());

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "roles_authenticated_read" ON public.roles;
CREATE POLICY "roles_authenticated_read" ON public.roles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "roles_super_admin_manage" ON public.roles;
CREATE POLICY "roles_super_admin_manage" ON public.roles FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "permissions_authenticated_read" ON public.permissions;
CREATE POLICY "permissions_authenticated_read" ON public.permissions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "permissions_super_admin_manage" ON public.permissions;
CREATE POLICY "permissions_super_admin_manage" ON public.permissions FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "role_permissions_authenticated_read" ON public.role_permissions;
CREATE POLICY "role_permissions_authenticated_read" ON public.role_permissions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "role_permissions_super_admin_manage" ON public.role_permissions;
CREATE POLICY "role_permissions_super_admin_manage" ON public.role_permissions FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
`;

export async function runDatabaseMigrations(pool: Pool): Promise<void> {
  logger.info('🔍 [Database Audit]: Checking operational tables in PostgreSQL schema...');
  try {
    // Ensure legacy 'name' column in users table is nullable for modern split name (first_name/last_name) compatibility
    try {
      await pool.query('ALTER TABLE public.users ALTER COLUMN name DROP NOT NULL;');
      logger.info("✅ [Database Audit]: Ensured 'name' column on public.users is nullable for OAuth and split-name compatibility.");
    } catch (colErr: any) {
      logger.debug(`[Database Audit]: Note on users.name modification: ${colErr.message}`);
    }

    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('housekeeping_tasks', 'maintenance_requests');
    `);

    const foundTables = res.rows.map(r => r.table_name);
    logger.info(`🔍 [Database Audit]: Found existing tables: ${JSON.stringify(foundTables)}`);

    if (!foundTables.includes('housekeeping_tasks') || !foundTables.includes('maintenance_requests')) {
      logger.warn('⚠️ [Database Audit]: Operational tables missing! Applying idempotent migration 012...');
      
      let sqlContent = FALLBACK_SQL_012;
      const possiblePaths = [
        path.join(process.cwd(), 'supabase', 'migrations', '012_housekeeping_and_maintenance.sql'),
        path.join(__dirname, '../../supabase/migrations/012_housekeeping_and_maintenance.sql'),
        path.join(__dirname, '../../../supabase/migrations/012_housekeeping_and_maintenance.sql')
      ];

      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          logger.info(`📂 [Database Audit]: Loading migration file from ${p}`);
          sqlContent = fs.readFileSync(p, 'utf8');
          break;
        }
      }

      await pool.query(sqlContent);
      logger.info('✅ [Database Audit]: Migration 012 applied successfully! Operational schema verified.');
    } else {
      logger.info('✅ [Database Audit]: Operational schema already present.');
    }

    // Ensure check constraints allow 'Verified', 'Reported', and 'On Hold' statuses idempotently without modifying columns
    try {
      await pool.query(`
        ALTER TABLE public.housekeeping_tasks DROP CONSTRAINT IF EXISTS housekeeping_tasks_status_check;
        ALTER TABLE public.housekeeping_tasks ADD CONSTRAINT housekeeping_tasks_status_check CHECK (status IN ('Pending', 'Accepted', 'In Progress', 'Completed', 'Verified', 'Cancelled'));
      `);
      await pool.query(`
        ALTER TABLE public.maintenance_requests DROP CONSTRAINT IF EXISTS maintenance_requests_status_check;
        ALTER TABLE public.maintenance_requests ADD CONSTRAINT maintenance_requests_status_check CHECK (status IN ('Pending', 'Reported', 'Assigned', 'In Progress', 'On Hold', 'Completed', 'Verified', 'Cancelled'));
      `);
      logger.info("✅ [Database Audit]: Ensured operational status check constraints support 'Verified', 'Reported', and 'On Hold' without schema disruption.");
    } catch (chkErr: any) {
      logger.debug(`[Database Audit]: Note on operational status check constraints modification: ${chkErr.message}`);
    }

    // Apply Migration 017: Enable RLS on 13 Supabase Advisor tables and verify Super Admin assignments
    try {
      logger.info('🔐 [Database Audit]: Applying idempotent Migration 017 (RLS policies on 13 Advisor tables & Super Admin roles)...');
      let sqlContent017 = FALLBACK_SQL_017;
      const possiblePaths017 = [
        path.join(process.cwd(), 'supabase', 'migrations', '017_enable_rls_and_super_admin.sql'),
        path.join(__dirname, '../../supabase/migrations/017_enable_rls_and_super_admin.sql'),
        path.join(__dirname, '../../../supabase/migrations/017_enable_rls_and_super_admin.sql'),
      ];

      for (const p of possiblePaths017) {
        if (fs.existsSync(p)) {
          logger.info(`📂 [Database Audit]: Loading migration file from ${p}`);
          sqlContent017 = fs.readFileSync(p, 'utf8');
          break;
        }
      }

      await pool.query(sqlContent017);
      logger.info('✅ [Database Audit]: Migration 017 applied successfully! RLS policies and Super Admin roles verified.');
    } catch (rlsErr: any) {
      logger.warn(`⚠️ [Database Audit]: Migration 017 execution note: ${rlsErr.message}`);
    }
  } catch (error: any) {
    logger.error(`❌ [Database Audit]: Migration check failed: ${error.message}`);
  }
}
