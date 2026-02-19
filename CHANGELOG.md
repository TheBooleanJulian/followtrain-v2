# Changelog

## [Unreleased]

### Added
- **ID Collision Handling**: Automatic retry mechanism for train creation that handles duplicate ID scenarios gracefully
- **Enhanced Database Schema**: Added `locked` and `expires_at` columns to trains table
- **Multi-Platform Support**: Support for Instagram, TikTok, Twitter, LinkedIn, YouTube, and Twitch
- **Admin Features**: Host management capabilities including lock/unlock trains and kick participants
- **Performance Improvements**: Avatar URL caching and rate limiting

### Changed
- **Database Structure**: Extended participants table with multiple platform username fields
- **Error Handling**: More robust error handling with specific collision detection
- **Documentation**: Updated README with comprehensive feature documentation

### Fixed
- **Train Creation Reliability**: Eliminated potential failure points from ID collisions
- **Input Validation**: Platform-specific username validation rules