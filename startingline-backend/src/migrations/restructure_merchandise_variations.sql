-- Restructure merchandise variations to support proper stock tracking per variation option
-- This migration creates a proper relational structure instead of JSONB storage

-- Step 1: Create new tables for proper variation structure
CREATE TABLE IF NOT EXISTS merchandise_variation_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchandise_id UUID NOT NULL REFERENCES event_merchandise(id) ON DELETE CASCADE,
    variation_name VARCHAR(100) NOT NULL, -- e.g., "Size", "Color"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique variation names per merchandise item
    UNIQUE(merchandise_id, variation_name)
);

CREATE TABLE IF NOT EXISTS merchandise_variation_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variation_type_id UUID NOT NULL REFERENCES merchandise_variation_types(id) ON DELETE CASCADE,
    option_value VARCHAR(100) NOT NULL, -- e.g., "Small", "Medium", "Large", "Red", "Blue"
    initial_stock INTEGER NOT NULL DEFAULT 0,
    current_stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure stock is not negative
    CHECK (current_stock >= 0),
    CHECK (initial_stock >= 0),
    
    -- Ensure unique option values per variation type
    UNIQUE(variation_type_id, option_value)
);

-- Step 2: Create indexes for performance
CREATE INDEX idx_merchandise_variation_types_merchandise_id ON merchandise_variation_types(merchandise_id);
CREATE INDEX idx_merchandise_variation_options_variation_type_id ON merchandise_variation_options(variation_type_id);
CREATE INDEX idx_merchandise_variation_options_stock ON merchandise_variation_options(current_stock);

-- Step 3: Migrate existing data from the old JSONB structure
-- Note: This will extract data from merchandise_variations.variation_options JSONB
INSERT INTO merchandise_variation_types (merchandise_id, variation_name)
SELECT DISTINCT 
    mv.merchandise_id,
    mv.variation_name
FROM merchandise_variations mv
WHERE mv.variation_name IS NOT NULL 
  AND mv.variation_name != ''
ON CONFLICT (merchandise_id, variation_name) DO NOTHING;

-- Extract variation options from JSONB and create individual records
-- This handles the new format: [{"stock": 10, "value": "Small"}, ...]
INSERT INTO merchandise_variation_options (variation_type_id, option_value, initial_stock, current_stock)
SELECT 
    mvt.id as variation_type_id,
    option_data->>'value' as option_value,
    COALESCE((option_data->>'stock')::integer, 0) as initial_stock,
    COALESCE((option_data->>'stock')::integer, 0) as current_stock
FROM merchandise_variations mv
JOIN merchandise_variation_types mvt ON mv.merchandise_id = mvt.merchandise_id 
    AND mv.variation_name = mvt.variation_name,
LATERAL jsonb_array_elements(mv.variation_options) as option_data
WHERE jsonb_typeof(mv.variation_options) = 'array'
  AND option_data ? 'value'
  AND option_data ? 'stock'
ON CONFLICT (variation_type_id, option_value) DO NOTHING;

-- Step 4: Update ticket_merchandise to reference the new variation option structure
-- Add new column to link to specific variation options
ALTER TABLE ticket_merchandise 
ADD COLUMN IF NOT EXISTS variation_option_id UUID REFERENCES merchandise_variation_options(id) ON DELETE SET NULL;

-- Step 5: Remove stock columns from event_merchandise since stock is now tracked per variation
-- (We'll do this in a separate migration after confirming everything works)
-- ALTER TABLE event_merchandise DROP COLUMN IF EXISTS available_stock;
-- ALTER TABLE event_merchandise DROP COLUMN IF EXISTS current_stock;

-- Step 6: Add comments for documentation
COMMENT ON TABLE merchandise_variation_types IS 'Defines variation types for merchandise items (e.g., Size, Color)';
COMMENT ON TABLE merchandise_variation_options IS 'Individual variation options with their own stock tracking (e.g., Small=10, Medium=15)';
COMMENT ON COLUMN merchandise_variation_options.initial_stock IS 'Initial stock quantity when the variation was created';
COMMENT ON COLUMN merchandise_variation_options.current_stock IS 'Current available stock for this specific variation option';
COMMENT ON COLUMN ticket_merchandise.variation_option_id IS 'Links to the specific variation option purchased (replaces variation_id)';
