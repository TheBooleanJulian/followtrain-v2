# 🚂 FollowTrain

https://followtrain-v2.vercel.app/

## At events?

Instead of:

"Wait what's your IG?"

"Spell that?"

"Pass your phone."


Just:


**1 QR code**

**Everyone joins**

**Everyone follows everyone**


**Done.**


No app.

No login.

Deletes in 72 hours.


It's AirDrop for socials. 🔥


A lightweight app that lets groups of people share and follow each other across multiple social media platforms via a shared link. No login required.

FollowTrain v2 is a lightweight React application designed to help groups share and follow each other across social media platforms through a simple, shared-link system. The project eliminates the need for user authentication while enabling real-time collaboration among participants. Users can create a "train" (a group), invite others via a unique shareable URL, and manage participants in real time. The application emphasizes simplicity, privacy, and cross-platform social media integration without requiring accounts or API calls to social networks.

## Features

- Create a follow train with a unique shareable URL
- **Automatic ID collision handling** - Never fails due to duplicate train IDs
- Join a train by entering name and social media usernames
- View all participants as profile cards with avatars
- Click any social media handle to open profiles directly
- **Enhanced export system** - Single export button with customizable platform selection including all 11 platforms
- **Smart username autocomplete** - Visual suggestions with avatar previews for duplicate names
- **Edit your own entries** - Users can modify their own profile information
- **Legal compliance** - Updated footer with copyright, terms, and privacy links
- **Working legal pages** - Terms and Privacy pages properly served on Vercel deployment
- Copy shareable link or QR code with one click
- **Admin controls** - Lock trains, kick participants, manage settings
- No login or account required
- Mobile-first responsive design with dark mode support

## Tech Stack

- **Frontend**: React with Tailwind CSS
- **Database**: Supabase (free tier)
- **Hosting**: Vercel (free tier)
- **Icons**: lucide-react

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
npx degit your-username/followtrain followtrain
cd followtrain
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a Supabase account at [https://supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key from Project Settings > API

4. Create environment variables:
```bash
cp .env.example .env
```
Then update `.env` with your Supabase credentials.

5. Set up the database:
   - Run the SQL schema from `schema.sql` in your Supabase SQL Editor
   - The schema is idempotent and safe to run multiple times
   - Make sure to enable Realtime on the participants table
   - The schema includes proper RLS policies with validation instead of overly permissive policies
   - **Note**: The schema includes a cleanup function for expired trains. For automatic cleanup, deploy the Edge Function in `supabase/functions/cleanup-trains.ts` and set up scheduling (see `SUPABASE_SCHEDULING.md` for detailed instructions)

6. Start the development server:
```bash
npm start
```

The app will run on [http://localhost:3000](http://localhost:3000).

## Database Schema

The application uses two tables:

### `trains`
- `id`: String (6-char random alphanumeric, uppercase) - Primary Key
- `name`: String (required, max 50 chars)
- `created_at`: Timestamp
- `locked`: Boolean (default: false) - Lock train to prevent new joins
- `expires_at`: Timestamp (default: 72 hours from creation) - Auto-expiry

### `participants`
- `id`: UUID - Primary Key
- `train_id`: String (foreign key to trains.id)
- `display_name`: String (required, max 100 chars)
- `instagram_username`: String (optional, max 30 chars)
- `tiktok_username`: String (optional, max 50 chars)
- `twitter_username`: String (optional, max 50 chars)
- `linkedin_username`: String (optional, max 100 chars) - LinkedIn profile URL
- `youtube_username`: String (optional, max 100 chars)
- `twitch_username`: String (optional, max 50 chars)
- `facebook_username`: String (optional, max 50 chars) - Facebook profile URL
- `whatsapp_number`: String (optional, max 15 chars) - Phone number with country code
- `telegram_username`: String (optional, max 32 chars)
- `discord_id`: String (optional, max 20 chars) - Discord username#tag or user ID
- `github_username`: String (optional, max 39 chars)
- `bio`: String (optional, max 100 chars)
- `is_host`: Boolean
- `admin_token`: String (24-char token for host admin access)
- `joined_at`: Timestamp
- `avatar_url`: Text (cached avatar URL for performance)

## Deployment

### Deploy to Vercel

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com/) and connect your GitHub account
3. Import your project
4. Add your environment variables in the Vercel dashboard:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
5. Deploy!

## Technical Features

### ID Collision Handling
See [ID_COLLISION_HANDLING.md](ID_COLLISION_HANDLING.md) for detailed documentation.

- **Automatic retry mechanism**: Generates new IDs if collision occurs
- **Smart error detection**: Only retries on unique constraint violations
- **Limited attempts**: Maximum 3 retry attempts to prevent infinite loops
- **Transparent to users**: Collisions are handled automatically without user intervention
- **Detailed logging**: Console logs collision detection and retry attempts

### Multi-Platform Support
- Instagram, TikTok, X/Twitter, Facebook, WhatsApp, LinkedIn, YouTube, Telegram, Discord, GitHub, Twitch
- Platform-specific username validation
- **LinkedIn profile URL requirement** for accurate profile linking
- **WhatsApp phone number validation** for proper messaging
- Dual-layer avatar system (primary platform + fallback)
- Smart deep linking for mobile devices
- Clean, simple input fields for all social media platforms

### Export System
- **Unified export interface**: Single button reveals comprehensive export panel
- **Customizable platform selection**: Checkboxes for each social media platform
- **Bulk operations**: Select All/Clear All functionality
- **Multiple export formats**: Copy to clipboard or download as TXT file
- **Clean UI**: Toggleable panel with proper spacing and organization


### Admin Features
- Host receives admin token for train management
- Lock/unlock trains to control new joins
- Kick participants from the train
- Clear all participants (host only)
- QR code generation for easy sharing
- Real-time participant management
- **Rename train functionality** - Change train name after creation
- **Edit participant entries** - Users can modify their own information

### Security & Performance
- **Enhanced Row Level Security (RLS) with proper validation policies** - No more overly permissive `WITH CHECK (true)` policies
- **Secure header-based authentication** - Uses `x-admin-token` for admin operations and `x-participant-id` for self-edit validation
- **Comprehensive input sanitization and validation to prevent prompt injection attacks**
- Input validation and sanitization for all user inputs
- Rate limiting for join requests
- Cached avatar URLs for better performance
- Automatic train expiry (72 hours)
- ESLint enforced code quality
- Cross-platform compatibility
- **Source maps disabled in production builds** to prevent code exposure
- **Proper environment variable management** with secure Vercel deployment practices

## Constraints

- No user authentication
- No social media API calls
- No profile data fetching
- No follower counts or verified badges
- No analytics
- Username validation per platform requirements
- **LinkedIn URL validation** with automatic parameter sanitization
- Duplicate username check within same train
- Train name max 50 chars
- Bio max 100 chars
- Train auto-expiry after 72 hours (adjustable by host)

## License

MIT