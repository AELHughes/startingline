-- Add available_stock column to event_merchandise table
ALTER TABLE event_merchandise
ADD COLUMN available_stock INTEGER;

-- Update existing rows to have a default value (e.g., 100 or unlimited)
UPDATE event_merchandise
SET available_stock = 100
WHERE available_stock IS NULL;

-- Make available_stock NOT NULL after setting default values
ALTER TABLE event_merchandise
ALTER COLUMN available_stock SET NOT NULL;

-- Add current_stock column to track remaining stock
ALTER TABLE event_merchandise
ADD COLUMN current_stock INTEGER;

-- Initialize current_stock to match available_stock
UPDATE event_merchandise
SET current_stock = available_stock
WHERE current_stock IS NULL;

-- Make current_stock NOT NULL after setting values
ALTER TABLE event_merchandise
ALTER COLUMN current_stock SET NOT NULL;

-- Add check constraint to ensure current_stock doesn't exceed available_stock
ALTER TABLE event_merchandise
ADD CONSTRAINT check_stock_limit 
CHECK (current_stock >= 0 AND current_stock <= available_stock);
