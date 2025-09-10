#!/usr/bin/env node

/**
 * Script to run the participant registration migration
 * This will create all necessary tables and functions for the participant system
 */

const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🚀 Starting participant registration migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '003_participant_registration_minimal.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded successfully');
    console.log('📋 Migration includes:');
    console.log('   - Payments table');
    console.log('   - Tickets table');
    console.log('   - Ticket merchandise table');
    console.log('   - User profiles table');
    console.log('   - Saved participants table');
    console.log('   - Indexes and constraints');
    console.log('   - Functions and triggers');
    console.log('   - Row Level Security policies');
    console.log('   - Analytics functions');
    
    console.log('\n📝 To apply this migration:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of:');
    console.log(`   ${migrationPath}`);
    console.log('4. Click "Run" to execute the migration');
    
    console.log('\n✅ Migration script prepared successfully!');
    console.log('\n⚠️  Important Notes:');
    console.log('   - This migration creates new tables and functions');
    console.log('   - Make sure to backup your database before running');
    console.log('   - The migration includes sample data for testing');
    console.log('   - RLS policies are enabled for security');
    
    // Also create a simplified version for quick setup
    const quickSetupPath = path.join(__dirname, 'quick-setup-participant-tables.sql');
    const quickSetupSQL = `
-- Quick Setup: Participant Registration Tables
-- Run this if you want to set up just the essential tables

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    primary_contact_first_name VARCHAR(100) NOT NULL,
    primary_contact_last_name VARCHAR(100) NOT NULL,
    primary_contact_email VARCHAR(255) NOT NULL,
    primary_contact_mobile VARCHAR(20) NOT NULL,
    primary_contact_company VARCHAR(255),
    primary_contact_address TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(20) DEFAULT 'ozow',
    transaction_id VARCHAR(255),
    transaction_reference VARCHAR(255) NOT NULL,
    bank_reference VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    distance_id UUID NOT NULL REFERENCES event_distances(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    participant_first_name VARCHAR(100) NOT NULL,
    participant_last_name VARCHAR(100) NOT NULL,
    participant_email VARCHAR(255) NOT NULL,
    participant_mobile VARCHAR(20) NOT NULL,
    participant_date_of_birth DATE NOT NULL,
    participant_medical_aid VARCHAR(255),
    participant_medical_aid_number VARCHAR(100),
    emergency_contact_name VARCHAR(100) NOT NULL,
    emergency_contact_number VARCHAR(20) NOT NULL,
    ticket_number VARCHAR(50) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    selected_merchandise JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_payments_event_id ON payments(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_payment_id ON tickets(payment_id);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Basic policies (allow all for now - customize as needed)
CREATE POLICY "Allow all operations on payments" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all operations on tickets" ON tickets FOR ALL USING (true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for timestamps
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

    fs.writeFileSync(quickSetupPath, quickSetupSQL);
    console.log(`\n📄 Quick setup file created: ${quickSetupPath}`);
    console.log('   Use this for a minimal setup with just the essential tables');
    
  } catch (error) {
    console.error('❌ Error preparing migration:', error.message);
    process.exit(1);
  }
}

// Run the script
runMigration();
