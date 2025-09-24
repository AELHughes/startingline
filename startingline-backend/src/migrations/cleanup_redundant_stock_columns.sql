-- FUTURE MIGRATION: Remove redundant stock columns from event_merchandise
-- Run this AFTER confirming all systems are using the new variation structure

-- NOTE: Don't run this immediately - keep for future cleanup
-- This removes columns that are no longer needed since we track stock
-- at the merchandise_variation_options level

-- Step 1: Remove check constraints that reference these columns
-- ALTER TABLE event_merchandise DROP CONSTRAINT IF EXISTS check_stock_limit;

-- Step 2: Remove the redundant columns
-- ALTER TABLE event_merchandise DROP COLUMN IF EXISTS available_stock;
-- ALTER TABLE event_merchandise DROP COLUMN IF EXISTS current_stock;

-- Step 3: Clean up other unused columns if needed
-- ALTER TABLE event_merchandise DROP COLUMN IF EXISTS stock_quantity;
-- ALTER TABLE event_merchandise DROP COLUMN IF EXISTS min_stock_level;
-- ALTER TABLE event_merchandise DROP COLUMN IF EXISTS max_stock_level;

-- For now, these columns remain with default values to ensure backward compatibility
COMMENT ON COLUMN event_merchandise.available_stock IS 'DEPRECATED: Use merchandise_variation_options.current_stock instead';
COMMENT ON COLUMN event_merchandise.current_stock IS 'DEPRECATED: Use merchandise_variation_options.current_stock instead';
