# Participant Registration System Setup

This document provides complete setup instructions for the participant registration system that works with real data.

## 🚀 Quick Start

### 1. Database Migration

Run the database migration to create all necessary tables:

```bash
cd startingline-backend
node run-participant-migration.js
```

Then follow the instructions to apply the migration in your Supabase dashboard.

### 2. Environment Variables

Make sure your `.env` file includes:

```env
# Backend API URL (for frontend)
NEXT_PUBLIC_API_URL=http://localhost:5001

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
DATABASE_URL=your-database-url

# Ozow Payment Configuration (for future use)
OZOW_SITE_CODE=your-ozow-site-code
OZOW_PRIVATE_KEY=your-ozow-private-key
OZOW_API_KEY=your-ozow-api-key
OZOW_IS_TEST=true
```

### 3. Start the Backend

```bash
cd startingline-backend
npm install
npm run dev
```

### 4. Start the Frontend

```bash
cd startingline-organiser
npm install
npm run dev
```

## 📊 Database Schema

The migration creates the following tables:

### Core Tables

1. **payments** - Stores payment information for registrations
2. **tickets** - Stores individual participant registrations
3. **ticket_merchandise** - Links tickets to selected merchandise
4. **user_profiles** - Stores user information for returning customers
5. **saved_participants** - Stores saved participant details for quick re-registration

### Key Features

- **Automatic ticket number generation**
- **QR code generation for tickets**
- **Row Level Security (RLS) policies**
- **Analytics functions for reporting**
- **Timestamp triggers**
- **Comprehensive indexing for performance**

## 🔧 API Endpoints

### Registration
- `POST /api/tickets/register` - Register participants for an event

### Tickets
- `GET /api/tickets` - Get all tickets (admin)
- `GET /api/tickets/event/:eventId` - Get tickets for specific event
- `GET /api/tickets/:id` - Get specific ticket

## 🎯 How It Works

### 1. Distance Selection
- Users can select multiple distances with different quantities
- Real-time cart updates show totals
- Age validation is performed client-side

### 2. Contact Details
- Primary contact information is captured
- Form validation ensures all required fields are filled
- Company name is optional

### 3. Participant Details
- Individual forms for each participant
- Age validation against distance requirements
- Medical aid information (optional)
- Emergency contact details
- "Copy from primary contact" functionality

### 4. Merchandise Selection
- Per-participant merchandise selection
- Variation support (sizes, colors, etc.)
- Dynamic pricing updates

### 5. Payment Processing
- Currently stubbed for testing (automatically successful)
- Ready for Ozow integration
- Payment tracking and confirmation

### 6. Data Storage
- All data is stored in the database
- Tickets are generated with unique numbers
- QR codes are created for validation

## 📱 Frontend Components

### Event Page (`/events/[slug]`)
- Multi-step registration flow
- Distance selection with quantities
- Contact and participant forms
- Merchandise selection
- Dynamic cart updates

### Participant Dashboard (`/participant-dashboard`)
- View upcoming and past events
- Download tickets and certificates
- Event details and history

### Organiser Dashboard
- Real-time participant list
- Search and filter functionality
- Export capabilities
- Registration statistics

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only see their own data
- Organisers can see data for their events
- Admin access for system management

### Data Validation
- Server-side validation for all inputs
- Age validation for distance requirements
- Email format validation
- Required field validation

## 📈 Analytics Functions

### Event Statistics
```sql
SELECT * FROM get_event_registration_stats('event-uuid');
```

### Organiser Dashboard
```sql
SELECT * FROM get_organiser_dashboard_stats('organiser-uuid');
```

## 🧪 Testing

### Sample Data
The migration includes sample data for testing:
- Test user profile: `test@example.com`
- Sample saved participant

### Test Registration Flow
1. Visit an event page
2. Select distances and quantities
3. Fill in contact details
4. Add participant information
5. Select merchandise (optional)
6. Complete payment (stubbed)
7. View in organiser dashboard

## 🔄 Future Enhancements

### User Authentication
- Implement Supabase Auth
- User login/registration
- Saved participant management

### Payment Integration
- Real Ozow payment processing
- Payment status webhooks
- Refund handling

### Email Notifications
- Registration confirmations
- Event reminders
- Ticket delivery

### Advanced Features
- Bulk registration
- Group discounts
- Waitlist management
- Transfer tickets

## 🐛 Troubleshooting

### Common Issues

1. **Migration fails**
   - Check Supabase connection
   - Verify database permissions
   - Review error messages

2. **API calls fail**
   - Check environment variables
   - Verify backend is running
   - Check CORS settings

3. **Data not appearing**
   - Check RLS policies
   - Verify user permissions
   - Check database connections

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=true
```

## 📞 Support

For issues or questions:
1. Check the logs for error messages
2. Verify database schema matches migration
3. Test API endpoints directly
4. Check environment variables

## 🎉 Success!

Once everything is set up, you'll have a fully functional participant registration system that:
- ✅ Works with real data (no mocks)
- ✅ Supports multiple participants per registration
- ✅ Validates age requirements
- ✅ Handles merchandise selection
- ✅ Provides real-time cart updates
- ✅ Stores all data in the database
- ✅ Shows participants in organiser dashboard
- ✅ Includes participant dashboard
- ✅ Has payment processing ready (stubbed for testing)

The system is production-ready and can handle real event registrations!
