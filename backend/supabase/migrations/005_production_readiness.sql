-- 005_production_readiness.sql

-- 1. Idempotency Keys Table
CREATE TABLE IF NOT EXISTS idempotency_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID,
    request_path VARCHAR(255) NOT NULL,
    response_body JSONB NOT NULL,
    response_status INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_key ON idempotency_keys(key);
