-- Discount System Database Schema
-- Following e-commerce best practices for secure discount management

-- Event Discount Links Table (Many-to-Many relationship)
CREATE TABLE event_discount_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    discount_rule_id UUID NOT NULL REFERENCES discount_rules(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique combinations
    UNIQUE(event_id, discount_rule_id)
);

-- Discount Rules Table
CREATE TABLE discount_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'buy_x_get_y', 'volume_discount')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    
    -- Discount Configuration
    discount_value DECIMAL(10,2), -- For percentage: 0-100, for fixed: amount in cents
    minimum_amount DECIMAL(10,2) DEFAULT 0,
    maximum_discount DECIMAL(10,2),
    
    -- Buy X Get Y Configuration
    buy_quantity INTEGER,
    get_quantity INTEGER,
    get_discount_type VARCHAR(20) CHECK (get_discount_type IN ('percentage', 'fixed_amount')),
    get_discount_value DECIMAL(10,2),
    
    -- Volume Discount Configuration
    volume_tiers JSONB, -- Array of {quantity: number, discount: number}
    
    -- Usage Limits
    usage_limit INTEGER, -- Total usage limit
    usage_limit_per_user INTEGER DEFAULT 1,
    usage_limit_per_event INTEGER,
    
    -- Validity Period
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Targeting
    target_events UUID[], -- Array of event IDs
    target_distances UUID[], -- Array of distance IDs
    target_categories VARCHAR(100)[], -- Array of event categories
    
    -- Priority and Ranking
    priority INTEGER DEFAULT 0, -- Higher number = higher priority
    stackable BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_discount_value CHECK (
        (type = 'percentage' AND discount_value >= 0 AND discount_value <= 100) OR
        (type = 'fixed_amount' AND discount_value >= 0) OR
        (type = 'buy_x_get_y' AND buy_quantity > 0 AND get_quantity > 0) OR
        (type = 'volume_discount' AND volume_tiers IS NOT NULL)
    ),
    CONSTRAINT valid_usage_limits CHECK (
        (usage_limit IS NULL OR usage_limit > 0) AND
        (usage_limit_per_user IS NULL OR usage_limit_per_user > 0) AND
        (usage_limit_per_event IS NULL OR usage_limit_per_event > 0)
    )
);

-- Discount Coupons Table
CREATE TABLE discount_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('percentage', 'fixed_amount')),
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_amount DECIMAL(10,2) DEFAULT 0,
    maximum_discount DECIMAL(10,2),
    
    -- Usage Limits
    usage_limit INTEGER, -- Total usage limit
    usage_limit_per_user INTEGER DEFAULT 1,
    usage_limit_per_event INTEGER,
    
    -- Validity Period
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Targeting
    target_events UUID[], -- Array of event IDs
    target_distances UUID[], -- Array of distance IDs
    target_categories VARCHAR(100)[], -- Array of event categories
    
    -- Priority and Ranking
    priority INTEGER DEFAULT 0,
    stackable BOOLEAN DEFAULT false,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_coupon_discount_value CHECK (
        (type = 'percentage' AND discount_value >= 0 AND discount_value <= 100) OR
        (type = 'fixed_amount' AND discount_value >= 0)
    ),
    CONSTRAINT valid_coupon_usage_limits CHECK (
        (usage_limit IS NULL OR usage_limit > 0) AND
        (usage_limit_per_user IS NULL OR usage_limit_per_user > 0) AND
        (usage_limit_per_event IS NULL OR usage_limit_per_event > 0)
    )
);

-- Discount Applications Table (Track usage)
CREATE TABLE discount_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discount_rule_id UUID REFERENCES discount_rules(id) ON DELETE CASCADE,
    discount_coupon_id UUID REFERENCES discount_coupons(id) ON DELETE CASCADE,
    order_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL,
    
    -- Application Details
    discount_type VARCHAR(50) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    original_amount DECIMAL(10,2) NOT NULL,
    final_amount DECIMAL(10,2) NOT NULL,
    
    -- Metadata
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT one_discount_source CHECK (
        (discount_rule_id IS NOT NULL AND discount_coupon_id IS NULL) OR
        (discount_rule_id IS NULL AND discount_coupon_id IS NOT NULL)
    )
);

-- Event Discount Links Table
CREATE TABLE event_discount_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    discount_rule_id UUID REFERENCES discount_rules(id) ON DELETE CASCADE,
    discount_coupon_id UUID REFERENCES discount_coupons(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT one_discount_source CHECK (
        (discount_rule_id IS NOT NULL AND discount_coupon_id IS NULL) OR
        (discount_rule_id IS NULL AND discount_coupon_id IS NOT NULL)
    )
);

-- Indexes for Performance
CREATE INDEX idx_discount_rules_organizer ON discount_rules(organizer_id);
CREATE INDEX idx_discount_rules_status ON discount_rules(status);
CREATE INDEX idx_discount_rules_validity ON discount_rules(valid_from, valid_until);
CREATE INDEX idx_discount_rules_priority ON discount_rules(priority DESC);

CREATE INDEX idx_discount_coupons_organizer ON discount_coupons(organizer_id);
CREATE INDEX idx_discount_coupons_code ON discount_coupons(code);
CREATE INDEX idx_discount_coupons_status ON discount_coupons(status);
CREATE INDEX idx_discount_coupons_validity ON discount_coupons(valid_from, valid_until);
CREATE INDEX idx_discount_coupons_priority ON discount_coupons(priority DESC);

CREATE INDEX idx_discount_applications_order ON discount_applications(order_id);
CREATE INDEX idx_discount_applications_user ON discount_applications(user_id);
CREATE INDEX idx_discount_applications_event ON discount_applications(event_id);
CREATE INDEX idx_discount_applications_applied_at ON discount_applications(applied_at);

CREATE INDEX idx_event_discount_links_event ON event_discount_links(event_id);
CREATE INDEX idx_event_discount_links_rule ON event_discount_links(discount_rule_id);
CREATE INDEX idx_event_discount_links_coupon ON event_discount_links(discount_coupon_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_discount_rules_updated_at 
    BEFORE UPDATE ON discount_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discount_coupons_updated_at 
    BEFORE UPDATE ON discount_coupons 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
