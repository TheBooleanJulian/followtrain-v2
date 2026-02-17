# FollowTrain

A lightweight app that lets groups of people share and follow each other on Instagram via a shared link. No login required.

## Features

- Create a follow train with a unique shareable URL
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

### `participants`
- `id`: UUID - Primary Key
- `train_id`: String (foreign key to trains.id)
- `display_name`: String (required)
- `username`: String (required, no @ symbol, lowercase, max 30 chars)
- `bio`: String (optional, max 100 chars)
- `is_host`: Boolean
- `joined_at`: Timestamp

## Deployment

### Deploy to Vercel

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com/) and connect your GitHub account
3. Import your project
4. Add your environment variables in the Vercel dashboard:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
5. Deploy!

## Constraints

- No user authentication
- No social media API calls
- No profile data fetching
- No follower counts or verified badges
- No train expiry
- No analytics
- No multi-platform support
- Username validation: alphanumeric, dots, underscores only, max 30 chars
- Duplicate username check within same train
- Train name max 50 chars

## License

MIT