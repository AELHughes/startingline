# Migration Troubleshooting Guide

## 🚨 Common Migration Errors and Solutions

### Error: `column "primary_contact_email" does not exist`

**Cause**: The migration is trying to reference a column before it's created, or there are existing tables with conflicts.

**Solution**: Use the simplified migration file:
```bash
# Use this file instead:
supabase/migrations/003_participant_registration_simple.sql
```

### Error: `operator does not exist: uuid = text`

**Cause**: RLS policies are trying to compare UUID fields with text values from JWT claims.

**Solution**: The simplified migration uses basic RLS policies that allow all operations for now.

### Error: `cannot change return type of existing function`

**Cause**: There's already a function with the same name but different return type.

**Solution**: Use the minimal migration that drops existing functions first.

## 🔧 Step-by-Step Migration Process

### Option 1: Use the Minimal Migration (Recommended)

1. **Copy the migration content**:
   ```bash
   cat supabase/migrations/003_participant_registration_minimal.sql
   ```

2. **Go to Supabase Dashboard**:
   - Navigate to SQL Editor
   - Paste the entire migration content
   - Click "Run"

### Option 2: Use the Basic Migration (If minimal fails)

1. **Copy the basic migration content**:
   ```bash
   cat supabase/migrations/003_participant_registration_basic.sql
   ```

2. **Go to Supabase Dashboard**:
   - Navigate to SQL Editor
   - Paste the entire migration content
   - Click "Run"

### Option 3: Manual Table Creation (If migration still fails)

If you continue to have issues, create the tables manually:

```sql
-- 1. Create payments table
CREATE TABLE payments (
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

-- 2. Create tickets table
CREATE TABLE tickets (
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

-- 3. Create indexes
CREATE INDEX idx_payments_event_id ON payments(event_id);
CREATE INDEX idx_tickets_event_id ON tickets(event_id);
CREATE INDEX idx_tickets_payment_id ON tickets(payment_id);

-- 4. Enable RLS (optional)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- 5. Create basic policies
CREATE POLICY "Allow all operations on payments" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all operations on tickets" ON tickets FOR ALL USING (true);
```

## 🔍 Verification Steps

After running the migration, verify it worked:

### 1. Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payments', 'tickets', 'user_profiles', 'saved_participants');
```

### 2. Check Table Structure
```sql
-- Check payments table
\d payments

-- Check tickets table  
\d tickets
```

### 3. Test Insert (Optional)
```sql
-- Test insert into payments (replace with real event_id)
INSERT INTO payments (
    event_id, 
    primary_contact_first_name, 
    primary_contact_last_name, 
    primary_contact_email, 
    primary_contact_mobile, 
    primary_contact_address,
    total_amount,
    transaction_reference,
    bank_reference
) VALUES (
    'your-event-id-here',
    'Test',
    'User',
    'test@example.com',
    '+27123456789',
    '123 Test Street',
    100.00,
    'TEST_REF_001',
    'TEST_BANK_001'
);
```

## 🚀 After Successful Migration

1. **Start the backend**:
   ```bash
   cd startingline-backend
   npm run dev
   ```

2. **Start the frontend**:
   ```bash
   cd startingline-organiser
   npm run dev
   ```

3. **Test the registration flow**:
   - Visit an event page
   - Try the registration process
   - Check if data appears in the database

## 🆘 Still Having Issues?

### Check Database Connection
```bash
# Test connection
psql "your-database-url"
```

### Check Supabase Status
- Verify your Supabase project is active
- Check if you have the correct permissions
- Ensure the database URL is correct

### Common Issues:
1. **Permission denied**: Make sure you're using the service role key
2. **Connection timeout**: Check your network and Supabase status
3. **Table already exists**: Drop existing tables first or use `CREATE TABLE IF NOT EXISTS`

### Reset and Start Fresh
If all else fails:
```sql
-- Drop all tables (CAREFUL - this deletes data!)
DROP TABLE IF EXISTS saved_participants CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS ticket_merchandise CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
```

Then run the simple migration again.

## ✅ Success Indicators

You'll know the migration worked when:
- ✅ Tables are created without errors
- ✅ Backend starts without database errors
- ✅ Frontend can register participants
- ✅ Data appears in the organiser dashboard
- ✅ No more "column does not exist" errors

## 📞 Need Help?

If you're still having issues:
1. Check the Supabase logs in your dashboard
2. Verify your environment variables
3. Test the database connection
4. Try the manual table creation approach

The system is designed to work with real data once the migration is successful!
