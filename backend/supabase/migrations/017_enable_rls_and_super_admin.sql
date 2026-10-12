-- Migration: 017_enable_rls_and_super_admin.sql
-- Description: Enables Row Level Security (RLS) on all 13 Supabase Advisor reported tables,
--              defines least-privilege security policies, and idempotently promotes
--              khuntpreet12@gmail.com and kenilbaldaniya510@gmail.com to Super Admin.

-- ============================================================================
-- 1. Helper Security Functions (SECURITY DEFINER for performance & safety)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.name = 'Super Admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_super()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.name IN ('Admin', 'Super Admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_hotel_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.name IN ('Admin', 'Super Admin', 'Manager', 'Receptionist', 'Reception')
  );
$$;

-- ============================================================================
-- 2. Idempotent Super Admin Role & User Verification
-- ============================================================================

-- Ensure Super Admin role exists
INSERT INTO public.roles (name, description, is_system) 
VALUES ('Super Admin', 'System super administrator with full unrestricted access', true)
ON CONFLICT (name) DO NOTHING;

-- Ensure SUPER_ADMIN permission exists
INSERT INTO public.permissions (name, description) 
VALUES ('SUPER_ADMIN', 'Bypasses all standard permission checks')
ON CONFLICT (name) DO NOTHING;

-- Ensure SUPER_ADMIN permission is linked to Super Admin role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'Super Admin' AND p.name = 'SUPER_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Promote the two verified accounts to Super Admin idempotently
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

-- ============================================================================
-- 3. Enable RLS and Least-Privilege Policies on all 13 reported tables
-- ============================================================================

-- Table 1: public.hotels
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hotels_public_read" ON public.hotels;
CREATE POLICY "hotels_public_read" ON public.hotels 
    FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "hotels_admin_manage" ON public.hotels;
CREATE POLICY "hotels_admin_manage" ON public.hotels 
    FOR ALL TO authenticated 
    USING (public.is_admin_or_super()) 
    WITH CHECK (public.is_admin_or_super());

-- Table 2: public.hotel_settings
ALTER TABLE public.hotel_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hotel_settings_staff_read" ON public.hotel_settings;
CREATE POLICY "hotel_settings_staff_read" ON public.hotel_settings 
    FOR SELECT TO authenticated 
    USING (public.is_hotel_staff());
DROP POLICY IF EXISTS "hotel_settings_admin_manage" ON public.hotel_settings;
CREATE POLICY "hotel_settings_admin_manage" ON public.hotel_settings 
    FOR ALL TO authenticated 
    USING (public.is_admin_or_super()) 
    WITH CHECK (public.is_admin_or_super());

-- Table 3: public.room_images
ALTER TABLE public.room_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "room_images_public_read" ON public.room_images;
CREATE POLICY "room_images_public_read" ON public.room_images 
    FOR SELECT USING (true);
DROP POLICY IF EXISTS "room_images_admin_manage" ON public.room_images;
CREATE POLICY "room_images_admin_manage" ON public.room_images 
    FOR ALL TO authenticated 
    USING (public.is_admin_or_super()) 
    WITH CHECK (public.is_admin_or_super());

-- Table 4: public.hotel_images
ALTER TABLE public.hotel_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hotel_images_public_read" ON public.hotel_images;
CREATE POLICY "hotel_images_public_read" ON public.hotel_images 
    FOR SELECT USING (true);
DROP POLICY IF EXISTS "hotel_images_admin_manage" ON public.hotel_images;
CREATE POLICY "hotel_images_admin_manage" ON public.hotel_images 
    FOR ALL TO authenticated 
    USING (public.is_admin_or_super()) 
    WITH CHECK (public.is_admin_or_super());

-- Table 5: public.invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invoices_owner_read" ON public.invoices;
CREATE POLICY "invoices_owner_read" ON public.invoices 
    FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = invoices.booking_id AND b.user_id = auth.uid()));
DROP POLICY IF EXISTS "invoices_staff_read" ON public.invoices;
CREATE POLICY "invoices_staff_read" ON public.invoices 
    FOR SELECT TO authenticated 
    USING (public.is_hotel_staff());
DROP POLICY IF EXISTS "invoices_admin_manage" ON public.invoices;
CREATE POLICY "invoices_admin_manage" ON public.invoices 
    FOR ALL TO authenticated 
    USING (public.is_admin_or_super()) 
    WITH CHECK (public.is_admin_or_super());

-- Table 6: public.user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_settings_owner_read" ON public.user_settings;
CREATE POLICY "user_settings_owner_read" ON public.user_settings 
    FOR SELECT TO authenticated 
    USING (user_id = auth.uid());
DROP POLICY IF EXISTS "user_settings_owner_modify" ON public.user_settings;
CREATE POLICY "user_settings_owner_modify" ON public.user_settings 
    FOR ALL TO authenticated 
    USING (user_id = auth.uid()) 
    WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "user_settings_admin_read" ON public.user_settings;
CREATE POLICY "user_settings_admin_read" ON public.user_settings 
    FOR SELECT TO authenticated 
    USING (public.is_admin_or_super());

-- Table 7: public.idempotency_keys
-- Strictly operational table: Zero public and authenticated client access.
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;
-- No permissive policies granted to anon/authenticated (server-side service role key only).

-- Table 8: public.booking_audit_logs
ALTER TABLE public.booking_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "booking_audit_logs_staff_read" ON public.booking_audit_logs;
CREATE POLICY "booking_audit_logs_staff_read" ON public.booking_audit_logs 
    FOR SELECT TO authenticated 
    USING (public.is_hotel_staff());

-- Table 9: public.admin_audit_logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_audit_logs_super_read" ON public.admin_audit_logs;
CREATE POLICY "admin_audit_logs_super_read" ON public.admin_audit_logs 
    FOR SELECT TO authenticated 
    USING (public.is_super_admin());

-- Table 10: public.auth_audit_logs
ALTER TABLE public.auth_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_audit_logs_admin_read" ON public.auth_audit_logs;
CREATE POLICY "auth_audit_logs_admin_read" ON public.auth_audit_logs 
    FOR SELECT TO authenticated 
    USING (public.is_admin_or_super());

-- Table 11: public.roles
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "roles_authenticated_read" ON public.roles;
CREATE POLICY "roles_authenticated_read" ON public.roles 
    FOR SELECT TO authenticated 
    USING (true);
DROP POLICY IF EXISTS "roles_super_admin_manage" ON public.roles;
CREATE POLICY "roles_super_admin_manage" ON public.roles 
    FOR ALL TO authenticated 
    USING (public.is_super_admin()) 
    WITH CHECK (public.is_super_admin());

-- Table 12: public.permissions
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "permissions_authenticated_read" ON public.permissions;
CREATE POLICY "permissions_authenticated_read" ON public.permissions 
    FOR SELECT TO authenticated 
    USING (true);
DROP POLICY IF EXISTS "permissions_super_admin_manage" ON public.permissions;
CREATE POLICY "permissions_super_admin_manage" ON public.permissions 
    FOR ALL TO authenticated 
    USING (public.is_super_admin()) 
    WITH CHECK (public.is_super_admin());

-- Table 13: public.role_permissions
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "role_permissions_authenticated_read" ON public.role_permissions;
CREATE POLICY "role_permissions_authenticated_read" ON public.role_permissions 
    FOR SELECT TO authenticated 
    USING (true);
DROP POLICY IF EXISTS "role_permissions_super_admin_manage" ON public.role_permissions;
CREATE POLICY "role_permissions_super_admin_manage" ON public.role_permissions 
    FOR ALL TO authenticated 
    USING (public.is_super_admin()) 
    WITH CHECK (public.is_super_admin());
