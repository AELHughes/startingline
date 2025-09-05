# Startingline WordPress/WooCommerce Site

This is the complete WordPress/WooCommerce website migrated from production hosting to local development.

## Project Structure

- **WordPress Core**: Latest WordPress installation
- **WooCommerce**: E-commerce functionality
- **Custom Themes**: 
  - `race-child` - Custom child theme
  - `thewebs` - Custom theme with extensive customization options
- **Plugins**: Various WordPress plugins including WooCommerce extensions
- **Database**: MySQL database with sample data

## Local Development Setup

### Prerequisites

- PHP 8.0 or higher
- MySQL 5.7 or higher (or MariaDB)
- Composer (for dependency management)
- Node.js and npm (for asset building)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url> startingline
   cd startingline
   ```

2. **Install MySQL** (if not already installed):
   ```bash
   # macOS with Homebrew
   brew install mysql
   brew services start mysql
   ```

3. **Create local database**:
   ```sql
   CREATE DATABASE startingline_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Import the database**:
   ```bash
   mysql -u root -p startingline_local < database/startix3e5q2_wp_hvham.sql
   ```

5. **Update wp-config-local.php** with your local MySQL credentials

6. **Update database URLs**:
   ```sql
   # Connect to your local database and update these URLs
   UPDATE wp_options SET option_value = 'http://localhost:8000' WHERE option_name = 'home';
   UPDATE wp_options SET option_value = 'http://localhost:8000' WHERE option_name = 'siteurl';
   ```

7. **Start local development server**:
   ```bash
   php -S localhost:8000
   ```

8. **Access the site**: http://localhost:8000

### Database Information

- **Production Database**: `startix3e5q2_wp_hvham`
- **Local Database**: `startingline_local`
- **Table Prefix**: `IULLNPS_`

### Development Notes

- The site uses a custom table prefix: `IULLNPS_`
- WooCommerce is fully configured with products and settings
- Custom themes contain SCSS files that may need compilation
- Various caching and optimization plugins are installed

### Deployment

When deploying back to production:

1. Update `wp-config.php` with production database credentials
2. Update site URLs in the database
3. Clear all caches
4. Test all functionality thoroughly

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test locally
4. Submit a pull request

## Support

For questions about this setup, refer to the WordPress and WooCommerce documentation or contact the development team.
