-- ============================================================================
-- MIGRATION 012: Housekeeping & Maintenance Management Modules (Sprints 2 & 3)
-- Enterprise architecture with soft delete, optimistic locking, and audit trail
-- ============================================================================

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
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE NULL, -- NULL implies broadcast to specified role
  role_target VARCHAR(50) NULL, -- e.g., 'Admin', 'Housekeeping', 'Technician', 'Reception'
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
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled')),
  priority VARCHAR(50) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Emergency')),
  remarks TEXT NULL,
  version INTEGER DEFAULT 1 NOT NULL, -- Optimistic locking concurrency control
  started_at TIMESTAMPTZ NULL,
  completed_at TIMESTAMPTZ NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  deleted_by UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL -- Soft delete support
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
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled')),
  estimated_cost NUMERIC(10, 2) DEFAULT 0.00,
  actual_cost NUMERIC(10, 2) DEFAULT 0.00,
  version INTEGER DEFAULT 1 NOT NULL, -- Optimistic locking concurrency control
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

-- 7. Create Maintenance Audit Logs Table (Full mutation & reporting history)
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
CREATE TRIGGER update_sys_notif_modtime
  BEFORE UPDATE ON system_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_housekeeping_tasks_modtime
  BEFORE UPDATE ON housekeeping_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cleaning_history_modtime
  BEFORE UPDATE ON cleaning_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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

-- Allow read/write for authenticated service roles and valid users
CREATE POLICY "Allow authenticated access to system_notifications" ON system_notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to housekeeping_tasks" ON housekeeping_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to cleaning_history" ON cleaning_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to maintenance_requests" ON maintenance_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to maintenance_audit_logs" ON maintenance_audit_logs FOR ALL USING (true) WITH CHECK (true);

-- 10. Configure Supabase Realtime Publications for zero-polling state updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'system_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE system_notifications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'housekeeping_tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE housekeeping_tasks;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'maintenance_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_requests;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Supabase Realtime publication setup encountered a minor warning: %', SQLERRM;
END;
$$;
