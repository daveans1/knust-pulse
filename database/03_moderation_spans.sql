-- 03_moderation_spans.sql
-- Add highlight_spans to store precise ML span triggers for the frontend

ALTER TABLE moderation_logs ADD COLUMN highlight_spans TEXT;
