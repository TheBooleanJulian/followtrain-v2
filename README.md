# FollowTrain

A lightweight app that lets groups of people share and follow each other on Instagram via a shared link. No login required.

## Features

- Create a follow train with a unique shareable URL
- **Automatic ID collision handling** - Never fails due to duplicate train IDs
- Join a train by entering name, Instagram username, and optional bio
- View all participants as profile cards
- Click any card to open that person's Instagram profile in a new tab
- Copy shareable link with one click
- No login or account required
- Mobile-first responsive design

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
   - Make sure to enable Realtime on the participants table

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
- `display_name`: String (required)
- `instagram_username`: String (optional, max 30 chars)
- `tiktok_username`: String (optional, max 50 chars)
- `twitter_username`: String (optional, max 50 chars)
- `linkedin_username`: String (optional, max 100 chars)
- `youtube_username`: String (optional, max 100 chars)
- `twitch_username`: String (optional, max 50 chars)
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
- Instagram, TikTok, Twitter, LinkedIn, YouTube, Twitch
- Platform-specific username validation
- Dual-layer avatar system (primary platform + fallback)

### Admin Features
- Host receives admin token for train management
- Lock/unlock trains to control new joins
- Kick participants from the train
- Clear all participants (host only)

### Security & Performance
- Row Level Security (RLS) enabled on all tables
- Input validation and sanitization
- Rate limiting for join requests
- Cached avatar URLs for better performance
- Automatic train expiry (72 hours)

## Constraints

- No user authentication
- No social media API calls
- No profile data fetching
- No follower counts or verified badges
- No analytics
- Username validation per platform requirements
- Duplicate username check within same train
- Train name max 50 chars
- Bio max 100 chars
- Train auto-expiry after 72 hours

## License

MIT