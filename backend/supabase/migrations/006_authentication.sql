-- Migration 006: Authentication & Security Schema

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification', 'deleted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Dynamic Role Management System
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 3. Alter Existing Users Table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS status user_status DEFAULT 'pending_verification';
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS postal_code VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- We don't drop the old `role` column to preserve backward compatibility,
-- but we might migrate data from it if we wanted to. We will just use `role_id` going forward.

-- 4. Create User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    language VARCHAR(50) DEFAULT 'en',
    timezone VARCHAR(100) DEFAULT 'UTC',
    theme VARCHAR(50) DEFAULT 'light',
    notification_preferences JSONB DEFAULT '{}'::jsonb
);

-- 5. Create Auth Audit Logs Table
CREATE TABLE IF NOT EXISTS auth_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Trigger to sync auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id UUID;
BEGIN
    -- Get the ID of the 'Guest' role
    SELECT id INTO default_role_id FROM public.roles WHERE name = 'Guest' LIMIT 1;
    
    INSERT INTO public.users (id, email, name, role_id, status)
    VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', 'User'), default_role_id, 'pending_verification');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: In a real Supabase environment, this trigger runs on auth.users.
-- If auth schema doesn't exist (e.g. testing with just PG), this might fail.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        EXECUTE 'CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()';
    END IF;
END $$;


-- 7. Seed System Roles
INSERT INTO roles (name, description, is_system) VALUES 
('Guest', 'Standard user who can book rooms and view own bookings', true),
('Receptionist', 'Staff who can manage bookings and check-in/out guests', true),
('Manager', 'Management who can view reports and approve refunds', true),
('Admin', 'System administrator with full access', true)
ON CONFLICT (name) DO NOTHING;

-- 8. Seed Basic Permissions
INSERT INTO permissions (name, description) VALUES 
('book_room', 'Can create new room bookings'),
('view_own_booking', 'Can view their own bookings'),
('cancel_own_booking', 'Can cancel their own bookings'),
('manage_bookings', 'Can view and modify any booking'),
('check_in', 'Can check in guests'),
('check_out', 'Can check out guests'),
('view_guests', 'Can view all guest details'),
('revenue_reports', 'Can view revenue and analytics reports'),
('approve_refunds', 'Can approve refund requests'),
('manage_pricing', 'Can modify room pricing'),
('full_access', 'Full administrative access')
ON CONFLICT (name) DO NOTHING;

-- 9. Map Permissions to Roles (Basic Seeding)
-- Example seeding for Guest
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'Guest' AND p.name IN ('book_room', 'view_own_booking', 'cancel_own_booking')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Example seeding for Receptionist
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'Receptionist' AND p.name IN ('manage_bookings', 'check_in', 'check_out', 'view_guests')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Example seeding for Manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'Manager' AND p.name IN ('revenue_reports', 'approve_refunds', 'manage_pricing', 'manage_bookings', 'view_guests')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Example seeding for Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'Admin' AND p.name = 'full_access'
ON CONFLICT (role_id, permission_id) DO NOTHING;
