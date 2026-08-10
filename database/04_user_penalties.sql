-- 04_user_penalties.sql
-- Add violation tracking and suspension timestamps for automated penalties

ALTER TABLE users ADD COLUMN violation_count INT DEFAULT 0;
ALTER TABLE users ADD COLUMN suspended_until TIMESTAMP;
