# Changelog

## [Unreleased]

### Added
- **ID Collision Handling**: Automatic retry mechanism for train creation that handles duplicate ID scenarios gracefully
- **Enhanced Database Schema**: Added `locked` and `expires_at` columns to trains table
- **Multi-Platform Support**: Support for Instagram, TikTok, X/Twitter, Facebook, WhatsApp, LinkedIn, YouTube, Telegram, Discord, GitHub, and Twitch
- **Legal Compliance**: Updated footer with copyright notice and terms/privacy links
- **Enhanced Validation**: Platform-specific validation for all 11 social media platforms
- **Admin Features**: Host management capabilities including lock/unlock trains and kick participants
- **Performance Improvements**: Avatar URL caching and rate limiting
- **Export System Refactor**: Unified export interface with toggleable panel
- **Dark Mode Improvements**: Enhanced UI contrast and visibility
- **Smart Autocomplete**: Visual username suggestions with avatar previews for disambiguation
- **Security Enhancement**: Comprehensive input sanitization to prevent prompt injection attacks
- **User Edit Functionality**: Participants can edit their own entries with full form validation
- **Train Rename Feature**: Hosts can rename trains through admin panel
- **Environment Configuration**: `.env` file with Supabase keys for local development
- **Vercel Deployment Fix**: Proper routing configuration for legal text files

### Changed
- **Database Structure**: Extended participants table with multiple platform username fields
- **Error Handling**: More robust error handling with specific collision detection
- **Export UI**: Replaced color-changing buttons with proper checkboxes
- **Documentation**: Updated README with comprehensive feature documentation
- **UI/UX**: Improved button styling and visual hierarchy
- **Input Fields**: Removed problematic autocomplete feature that was causing typing interruptions and false matches
- **Social Media Inputs**: Simplified to regular input fields for better user experience
- **Vercel Configuration**: Updated routing rules to properly serve static text files
- **Legal Page Component**: Enhanced error handling and logging for better debugging

### Fixed
- **Train Creation Reliability**: Eliminated potential failure points from ID collisions
- **Input Validation**: Platform-specific username validation rules
- **Dark Mode Visibility**: QR code button color contrast issues
- **Build Issues**: ESLint warnings and cross-platform compatibility
- **User Experience**: Added visual aids for username disambiguation
- **Legal Pages on Vercel**: Fixed routing configuration to properly serve TERMS.txt and PRIVACY.txt files
- **Static File Serving**: Corrected Vercel routes for .txt files with proper content-type headers
- **Environment Variables**: Created secure .env file setup with proper .gitignore configuration