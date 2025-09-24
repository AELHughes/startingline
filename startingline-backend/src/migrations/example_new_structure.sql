-- Example of how the new variation structure would work

-- Example data after migration:

-- 1. Merchandise item (no stock here)
-- event_merchandise: 
-- id=merch-123, name="Shirt", price=150.00

-- 2. Variation types for this merchandise
-- merchandise_variation_types:
-- id=type-456, merchandise_id=merch-123, variation_name="Size"

-- 3. Individual variation options with their own stock
-- merchandise_variation_options:
-- id=opt-001, variation_type_id=type-456, option_value="Small",  initial_stock=10, current_stock=9
-- id=opt-002, variation_type_id=type-456, option_value="Medium", initial_stock=10, current_stock=9  
-- id=opt-003, variation_type_id=type-456, option_value="Large",  initial_stock=10, current_stock=10

-- 4. When someone buys "Medium", we link to opt-002
-- ticket_merchandise:
-- ticket_id=ticket-789, merchandise_id=merch-123, variation_option_id=opt-002, quantity=1

-- 5. Stock reduction only affects the specific option:
-- UPDATE merchandise_variation_options 
-- SET current_stock = current_stock - 1 
-- WHERE id = 'opt-002';  -- Only Medium stock reduces

-- Query to get stock summary (what you see in the UI):
SELECT 
    em.name as merchandise_name,
    mvt.variation_name,
    mvo.option_value,
    mvo.initial_stock,
    mvo.current_stock,
    (mvo.initial_stock - mvo.current_stock) as sold,
    mvo.current_stock as remaining
FROM event_merchandise em
JOIN merchandise_variation_types mvt ON em.id = mvt.merchandise_id
JOIN merchandise_variation_options mvo ON mvt.id = mvo.variation_type_id
WHERE em.name = 'Shirt'
ORDER BY mvt.variation_name, mvo.option_value;

-- Result would be:
-- merchandise_name | variation_name | option_value | initial_stock | current_stock | sold | remaining
-- Shirt           | Size           | Large        | 10            | 10            | 0    | 10
-- Shirt           | Size           | Medium       | 10            | 9             | 1    | 9  
-- Shirt           | Size           | Small        | 10            | 9             | 1    | 9
