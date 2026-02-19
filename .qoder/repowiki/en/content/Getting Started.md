# Getting Started

<cite>
**Referenced Files in This Document**
- [README.md](file://README.md)
- [package.json](file://package.json)
- [.env.example](file://.env.example)
- [schema.sql](file://schema.sql)
- [src/supabaseClient.js](file://src/supabaseClient.js)
- [src/App.js](file://src/App.js)
- [src/index.js](file://src/index.js)
- [tailwind.config.js](file://tailwind.config.js)
- [public/index.html](file://public/index.html)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Environment Setup with Supabase](#environment-setup-with-supabase)
5. [Database Schema Setup](#database-schema-setup)
6. [Local Development Server](#local-development-server)
7. [Complete Workflow](#complete-workflow)
8. [Verification Steps](#verification-steps)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Conclusion](#conclusion)

## Introduction
FollowTrain is a lightweight React application that enables groups to share and follow each other across multiple social media platforms via a unique, shareable link. The application requires no login or account creation and features a mobile-first responsive design built with Tailwind CSS.

The application uses Supabase for backend services, including PostgreSQL database storage and real-time subscriptions. It supports multiple social media platforms (Instagram, TikTok, Twitter/X, LinkedIn, YouTube, Twitch) and provides real-time updates when new participants join a train.

## Prerequisites
Before installing FollowTrain, ensure you have the following prerequisites installed on your development machine:

- **Node.js**: Version 14 or higher (required for React development)
- **Package Manager**: npm or yarn (both supported)
- **Git**: For cloning the repository (recommended)
- **Text Editor**: VS Code or any preferred code editor

These requirements are essential for running the React development server and managing project dependencies locally.

**Section sources**
- [README.md](file://README.md#L24-L27)
- [package.json](file://package.json#L1-L44)

## Installation
Follow these step-by-step instructions to install and set up FollowTrain locally:

### Step 1: Clone the Repository
Clone the FollowTrain repository to your local machine using degit (recommended) or git:

```bash
npx degit your-username/followtrain followtrain
cd followtrain
```

### Step 2: Install Dependencies
Install all required dependencies using npm:

```bash
npm install
```

This command installs all packages listed in the dependencies section of package.json, including React, Supabase client library, Tailwind CSS, and development tools.

### Step 3: Verify Installation
After installation completes, verify that all dependencies are properly installed by checking the node_modules folder and ensuring there are no errors in the terminal output.

**Section sources**
- [README.md](file://README.md#L29-L41)
- [package.json](file://package.json#L6-L11)

## Environment Setup with Supabase
Follow these instructions to configure your Supabase environment variables:

### Step 1: Create Supabase Account
1. Visit [Supabase](https://supabase.com) and create a free account
2. Complete the email verification process
3. Navigate to the Supabase dashboard

### Step 2: Create New Project
1. Click "New Project" in the dashboard
2. Enter a project name (e.g., "followtrain-dev")
3. Select your preferred database region
4. Review and accept the terms of service
5. Wait for project creation to complete

### Step 3: Obtain Credentials
1. Go to your project dashboard
2. Navigate to "Settings" → "API"
3. Copy the following values:
   - **Project URL**: Found under "Project URL"
   - **Anonymous Key**: Found under "anon public" key
4. Keep these values secure and do not commit them to version control

### Step 4: Configure Environment Variables
1. Create a copy of the example environment file:
```bash
cp .env.example .env
```
2. Open the newly created `.env` file and replace the placeholder values with your actual Supabase credentials:
   - Set `REACT_APP_SUPABASE_URL` to your project URL
   - Set `REACT_APP_SUPABASE_ANON_KEY` to your anonymous key

### Step 5: Verify Configuration
1. Restart your development server to load the new environment variables
2. Test the database connection using the built-in test button in the application
3. Check the browser console for any connection errors

**Section sources**
- [README.md](file://README.md#L42-L51)
- [.env.example](file://.env.example#L1-L9)
- [src/supabaseClient.js](file://src/supabaseClient.js#L1-L6)

## Database Schema Setup
Follow these steps to set up the database schema in your Supabase project:

### Step 1: Access Supabase SQL Editor
1. In your Supabase dashboard, navigate to "SQL Editor" from the left sidebar
2. Click "New Query" to open a blank editor

### Step 2: Run the Schema
1. Copy the entire contents of `schema.sql` from the repository
2. Paste the SQL code into the SQL Editor
3. Click "Run" to execute the schema creation

### Step 3: Enable Realtime Subscription
1. After schema creation, go to "Database" → "Tables" in the Supabase dashboard
2. Find the `participants` table
3. Click on the table name to open its settings
4. Enable "Realtime" for the participants table
5. Save the changes

### Step 4: Verify Schema Creation
1. In the SQL Editor, run a simple SELECT query:
```sql
SELECT COUNT(*) FROM trains;
SELECT COUNT(*) FROM participants;
```
2. Both queries should return 0 (no records yet)
3. Verify that the tables have the correct column definitions and constraints

### Step 5: Enable Row Level Security
The schema automatically enables Row Level Security (RLS) for both tables. RLS policies allow all operations (`FOR ALL USING (true)`) since the application doesn't require user authentication.

**Section sources**
- [README.md](file://README.md#L53-L55)
- [schema.sql](file://schema.sql#L1-L38)

## Local Development Server
Start the development server to run FollowTrain locally:

### Step 1: Launch Development Server
```bash
npm start
```

This command starts the React development server on port 3000.

### Step 2: Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

### Step 3: Development Features
The development server provides several helpful features:
- **Hot Reloading**: Automatically refreshes the page when you save changes
- **Error Reporting**: Displays compilation errors in the browser console
- **Development Tools**: Full React Developer Tools support
- **Source Maps**: Enables debugging with original source code

### Step 4: Stop the Server
Press `Ctrl + C` in the terminal to stop the development server when you're finished working.

**Section sources**
- [README.md](file://README.md#L57-L62)
- [package.json](file://package.json#L7-L7)

## Complete Workflow
Follow this end-to-end workflow from cloning to running the application:

### Phase 1: Initial Setup
1. **Clone Repository**: Use degit to clone the project
2. **Install Dependencies**: Run `npm install`
3. **Create Supabase Account**: Sign up at Supabase.com
4. **Create Project**: Set up a new Supabase project
5. **Configure Environment**: Copy `.env.example` to `.env` and add credentials

### Phase 2: Database Configuration
1. **Access SQL Editor**: Navigate to Supabase SQL Editor
2. **Run Schema**: Execute the complete schema from `schema.sql`
3. **Enable Realtime**: Turn on Realtime subscription for the participants table
4. **Verify Setup**: Run basic queries to confirm table creation

### Phase 3: Development Environment
1. **Start Server**: Run `npm start`
2. **Test Connection**: Use the built-in database test button
3. **Explore UI**: Navigate through the application interface
4. **Create First Train**: Test the complete workflow

### Phase 4: Testing and Validation
1. **Create Train**: Use the "Create a Train" feature
2. **Join Train**: Test joining an existing train
3. **Real-time Updates**: Verify live participant updates
4. **Copy Link**: Test sharing functionality

**Section sources**
- [README.md](file://README.md#L22-L62)

## Verification Steps
Perform these verification steps to ensure proper installation:

### Step 1: Environment Variables Check
1. Confirm `.env` file exists and contains your Supabase credentials
2. Verify environment variables are loaded by checking the browser console
3. Look for any "Missing REACT_APP_SUPABASE_URL" or "Missing REACT_APP_SUPABASE_ANON_KEY" errors

### Step 2: Database Connection Test
1. In the application, click the "🧪 Test Database Connection" button
2. A success message should appear indicating the database is reachable
3. Check the browser console for any database-related errors

### Step 3: Schema Verification
1. In the Supabase SQL Editor, run:
```sql
SELECT * FROM trains LIMIT 1;
SELECT * FROM participants LIMIT 1;
```
2. Both queries should execute without errors
3. Verify table structures match the schema definition

### Step 4: Real-time Functionality
1. Open two browser tabs to `http://localhost:3000`
2. Create a train in the first tab
3. Join the same train in the second tab
4. Verify both tabs show real-time updates

### Step 5: Application Features
1. **Create Train**: Test the complete train creation workflow
2. **Join Train**: Verify username validation and duplicate checking
3. **Copy Link**: Test the shareable link functionality
4. **Dark Mode**: Toggle between light and dark themes
5. **Responsive Design**: Test on different screen sizes

**Section sources**
- [src/App.js](file://src/App.js#L185-L205)
- [src/App.js](file://src/App.js#L127-L145)

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue 1: Missing Environment Variables
**Problem**: Application fails to connect to Supabase with "Missing REACT_APP_SUPABASE_URL" error
**Solution**:
1. Ensure `.env` file exists in the project root
2. Verify the file contains both `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`
3. Restart the development server after making changes
4. Check that the environment variables are prefixed with `REACT_APP_`

#### Issue 2: Database Connection Errors
**Problem**: "Database Error" messages when testing connection
**Solution**:
1. Verify your Supabase project URL and anonymous key are correct
2. Check that the database tables were created successfully
3. Ensure Realtime is enabled for the participants table
4. Confirm your Supabase project is not in maintenance mode

#### Issue 3: Schema Not Found Errors
**Problem**: "Database not set up" or "tables not found" errors
**Solution**:
1. Re-run the schema.sql file in the Supabase SQL Editor
2. Verify both `trains` and `participants` tables exist
3. Check that Row Level Security policies are enabled
4. Ensure the SQL editor shows no errors during schema execution

#### Issue 4: Real-time Updates Not Working
**Problem**: Participants don't appear in real-time when others join
**Solution**:
1. Verify Realtime is enabled for the participants table in Supabase
2. Check browser console for WebSocket connection errors
3. Ensure the development server is running on port 3000
4. Test with multiple browser tabs or incognito windows

#### Issue 5: Port Conflicts
**Problem**: "Port 3000 is already in use" error
**Solution**:
1. Close other applications using port 3000
2. Kill processes using port 3000:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # macOS/Linux
   lsof -i :3000
   ```
3. Start the development server again

#### Issue 6: Username Validation Failures
**Problem**: "Invalid [platform] username" errors
**Solution**:
1. Check username length limits for each platform
2. Verify allowed characters for each platform:
   - Instagram: alphanumeric, dots, underscores (max 30 chars)
   - TikTok: alphanumeric, dots, underscores (max 50 chars)
   - Twitter/X: alphanumeric, underscores (max 50 chars)
   - LinkedIn: alphanumeric, dashes, dots (max 100 chars)
   - YouTube: alphanumeric only (max 100 chars)
   - Twitch: alphanumeric, underscores (max 50 chars)
3. Remove any special characters or spaces from usernames

#### Issue 7: Duplicate Username Errors
**Problem**: "This [platform] username is already in the train" error
**Solution**:
1. Use a different username for the same platform within the same train
2. Remove the @ symbol from usernames (application handles this automatically)
3. Ensure usernames are unique within the same train context

#### Issue 8: Build Errors
**Problem**: Compilation errors when running `npm install`
**Solution**:
1. Clear npm cache: `npm cache clean --force`
2. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check Node.js version compatibility
4. Ensure you're using Node.js 14 or higher

**Section sources**
- [src/App.js](file://src/App.js#L147-L177)
- [src/App.js](file://src/App.js#L347-L360)
- [src/App.js](file://src/App.js#L218-L240)

## Conclusion
You have successfully configured FollowTrain v2 for local development. The application is now ready for development and testing. Here's what you've accomplished:

- ✅ Installed all required dependencies
- ✅ Configured Supabase environment variables
- ✅ Set up the complete database schema
- ✅ Enabled real-time functionality
- ✅ Started the development server
- ✅ Verified all core features work correctly

### Next Steps
- Explore the codebase to understand the React component structure
- Test all social media platform integrations
- Experiment with the dark mode and responsive design features
- Deploy to production using Vercel (see deployment section in README)
- Customize styling using Tailwind CSS classes
- Add new social media platforms by extending the schema and validation logic

### Production Considerations
When deploying to production:
- Use Vercel's environment variable management
- Enable HTTPS and proper domain configuration
- Monitor Supabase usage limits on the free tier
- Consider adding rate limiting for database operations
- Implement proper error handling and logging

The application is designed to be lightweight and efficient, making it ideal for small to medium-sized groups who want to easily share and follow each other across multiple social media platforms without requiring accounts or logins.