-- Migration: 010_super_admin.sql
-- Description: Adds Super Admin roles, permissions, normalized room/hotel images, and admin audit logs.

-- 1. Create Roles and Permissions for Super Admin
INSERT INTO roles (name, description, is_system) VALUES 
('Super Admin', 'System super administrator with full unrestricted access', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description) VALUES 
('SUPER_ADMIN', 'Bypasses all standard permission checks')
ON CONFLICT (name) DO NOTHING;

-- Assign SUPER_ADMIN permission to Super Admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'Super Admin' AND p.name = 'SUPER_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;


-- 2. Seed the Default Super Admin Account
-- Password: K1e2n3i4l5!!
-- Supabase uses bcrypt for password hashing in auth.users. 
-- For a safe migration seed, we use pgcrypto.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ 
DECLARE
    super_admin_role_id UUID;
    admin_uuid UUID := '22222222-2222-2222-2222-222222222222'::uuid; -- A fixed UUID for the default admin
BEGIN
    SELECT id INTO super_admin_role_id FROM public.roles WHERE name = 'Super Admin' LIMIT 1;

    -- Ensure auth.users has this user
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = '2403051051049@paruluniversity.ac.in') THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
            recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, 
            created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', admin_uuid, 'authenticated', 'authenticated', '2403051051049@paruluniversity.ac.in',
            crypt('K1e2n3i4l5!!', gen_salt('bf')), NOW(), 
            NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Super Admin"}',
            NOW(), NOW(), '', '', '', ''
        );
    ELSE
        SELECT id INTO admin_uuid FROM auth.users WHERE email = '2403051051049@paruluniversity.ac.in' LIMIT 1;
        -- Update password just in case
        UPDATE auth.users SET encrypted_password = crypt('K1e2n3i4l5!!', gen_salt('bf')) WHERE id = admin_uuid;
    END IF;

    -- Ensure public.users has this user and correct role
    -- Note: handle_new_user trigger might have already created this row as a Guest. We must update it.
    IF EXISTS (SELECT 1 FROM public.users WHERE id = admin_uuid) THEN
        UPDATE public.users SET role_id = super_admin_role_id, status = 'active', first_name = 'Super', last_name = 'Admin' WHERE id = admin_uuid;
    ELSE
        INSERT INTO public.users (id, email, first_name, last_name, role_id, status)
        VALUES (admin_uuid, '2403051051049@paruluniversity.ac.in', 'Super', 'Admin', super_admin_role_id, 'active');
    END IF;
END $$;


-- 3. Room Lifecycle Status constraint modification
-- (Drop existing to include 'out_of_service', standardizing 'available', 'occupied', 'maintenance', 'out_of_service')
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_status_check;
ALTER TABLE rooms ADD CONSTRAINT rooms_status_check 
    CHECK (status IN ('available', 'reserved', 'occupied', 'cleaning', 'maintenance', 'blocked', 'out_of_service'));


-- 4. Normalize Room Images
CREATE TABLE IF NOT EXISTS public.room_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_room_images_room_id ON public.room_images(room_id);

-- Optional: Migrate existing array images to the new table
DO $$
DECLARE
    r RECORD;
    idx INTEGER;
    img TEXT;
BEGIN
    -- Check if 'images' column exists on rooms table before attempting migration
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rooms' AND column_name='images') THEN
        FOR r IN SELECT id, images FROM public.rooms WHERE images IS NOT NULL AND jsonb_array_length(images) > 0 LOOP
            idx := 0;
            FOR img IN SELECT jsonb_array_elements_text(r.images) LOOP
                INSERT INTO public.room_images (room_id, image_url, display_order, is_featured)
                VALUES (r.id, img, idx, (idx = 0)) ON CONFLICT DO NOTHING;
                idx := idx + 1;
            END LOOP;
        END LOOP;
    END IF;
END $$;


-- 5. Hotel Gallery Images
CREATE TABLE IF NOT EXISTS public.hotel_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type VARCHAR(50) DEFAULT 'gallery' CHECK (image_type IN ('logo', 'banner', 'gallery')),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hotel_images_hotel_id ON public.hotel_images(hotel_id);


-- 6. Extend Hotel Settings Table
ALTER TABLE public.hotel_settings ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.hotel_settings ADD COLUMN IF NOT EXISTS banner_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.hotel_settings ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.hotel_settings ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE public.hotel_settings ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.hotel_settings ADD COLUMN IF NOT EXISTS cancellation_policy TEXT;
ALTER TABLE public.hotel_settings ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;


-- 7. Admin Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_role VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    before_state JSONB,
    after_state JSONB,
    request_id VARCHAR(255),
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_user_id ON public.admin_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_entity ON public.admin_audit_logs(entity_type, entity_id);
