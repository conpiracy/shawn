# ScriptAI Setup Guide

## Overview
ScriptAI is an AI-powered script writing assistant for creating high-retention short-form video content for TikTok, Instagram Reels, and YouTube Shorts.

## Features
- **AI Script Writer**: Generate compelling hooks, complete scripts, and topic ideas using AI
- **Script Library**: Save, organize, and manage your generated content
- **Usage Tracking**: Monitor API usage with subscription-based limits
- **Supabase Database**: Persistent storage for conversations, messages, and scripts
- **Convex Backend**: Real-time, type-safe backend with authentication
- **Stripe Integration**: Ready-to-use payment processing for Pro subscriptions

## Prerequisites
- Node.js 18+ installed
- OpenAI API key
- Convex account
- Supabase project (already configured)

## Environment Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
The `.env` file contains the following variables:

```env
# Supabase Configuration (already configured)
VITE_SUPABASE_URL=https://tqpclyxpsztrtsignzrf.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# OpenAI API Key (REQUIRED - add your key)
OPENAI_API_KEY=your_openai_api_key_here
```

**Important**: Replace `your_openai_api_key_here` with your actual OpenAI API key from https://platform.openai.com/api-keys

### 3. Convex Setup
```bash
# Initialize Convex (if not already done)
npx convex dev

# This will:
# - Create a new Convex project or connect to existing one
# - Generate API types in convex/_generated/
# - Start the Convex development server
```

### 4. Run Development Server
```bash
npm run dev
```

This starts both the Vite frontend and Convex backend in parallel.

## Database Schema

The Supabase database includes the following tables:

### conversations
Stores chat sessions between users and the AI
- `id` (uuid) - Conversation identifier
- `user_id` (text) - User reference
- `title` (text) - Conversation title
- `created_at` / `updated_at` (timestamptz) - Timestamps

### messages
Individual messages within conversations
- `id` (uuid) - Message identifier
- `conversation_id` (uuid) - Foreign key to conversations
- `role` (text) - 'user' or 'assistant'
- `content` (text) - Message content
- `created_at` (timestamptz) - Timestamp

### scripts
Saved generated content
- `id` (uuid) - Script identifier
- `user_id` (text) - User reference
- `type` (text) - 'hook', 'script', 'topic', 'full_video'
- `category` (text) - 'educational', 'lifestyle', 'opinion', 'engagement'
- `title` (text) - Script title
- `content` (text) - Script content
- `metadata` (jsonb) - Additional metadata
- `is_favorite` (boolean) - Favorite flag
- `created_at` / `updated_at` (timestamptz) - Timestamps

### usage_tracking
API usage monitoring
- `id` (uuid) - Record identifier
- `user_id` (text) - User reference
- `request_type` (text) - Type of AI request
- `tokens_used` (integer) - Tokens consumed
- `success` (boolean) - Request status
- `month` (text) - Month in YYYY-MM format
- `created_at` (timestamptz) - Timestamp

## Usage Limits

### Free Tier
- 10 AI generations per month
- Access to all hook types and script templates
- Save up to 50 scripts

### Pro Tier ($9.99/month)
- Unlimited AI generations
- Unlimited saved scripts
- Priority support
- Advanced analytics (coming soon)

## AI Instructions

The AI is trained on proven frameworks from 5 instruction files located in `convex/ai-instructions/`:

1. **qualiferbot-custom-instructions.md** - Main bot behavior and workflow
2. **educational-hooks.md** - Educational content frameworks
3. **hooks-lifestyle.cleaned.md** - Lifestyle content patterns
4. **engagement-hooks.md** - Opinion and engagement hooks
5. **script-instructions.md** - Full video script structure

These instructions are automatically loaded and combined into the AI system prompt.

## Key Features

### AI Writer (`/dashboard/ai-writer`)
- Chat-style interface for natural conversation
- Context fields for niche, target audience, and brand tone
- Real-time streaming responses
- Save favorite generations directly from chat

### Script Library (`/dashboard/scripts`)
- View all saved scripts and hooks
- Filter by type (hook, script, topic, full video)
- Filter by category (educational, lifestyle, opinion, engagement)
- Search functionality
- Copy to clipboard
- Mark favorites
- Delete unwanted content

### Dashboard (`/dashboard`)
- Usage statistics
- Quick access to recent scripts
- Account overview

## Development Notes

### Adding New AI Instructions
To add new instruction sets:
1. Create a new `.md` file in `convex/ai-instructions/`
2. The file will be automatically included in the system prompt
3. Follow the existing format with clear categories and examples

### Modifying Usage Limits
Edit `convex/ai.ts` to adjust free/pro tier limits:
```typescript
export const checkUsageLimit = mutation({
  handler: async (_ctx, args) => {
    // Implement your limit logic here
    // Current: 10 generations for free tier
    return true;
  },
});
```

### Customizing Hook Types
Edit the script categories in:
- Supabase migration files
- `src/routes/_app/_auth/dashboard/_layout.scripts.tsx`
- AI instruction files

## Troubleshooting

### Build Errors
If you encounter TypeScript errors during build:
1. Ensure Convex is running (`npm run dev:backend`)
2. Wait for Convex to generate types in `convex/_generated/`
3. The TanStack Router will auto-generate route types during build

### AI Not Responding
1. Verify `OPENAI_API_KEY` is set correctly in `.env`
2. Check Convex logs for API errors
3. Ensure you have OpenAI API credits

### Database Errors
1. Verify Supabase credentials in `.env`
2. Check Row Level Security policies are enabled
3. Confirm migrations ran successfully

## Deployment

### Frontend (Netlify/Vercel)
1. Connect your repository
2. Set environment variables
3. Build command: `npm run build`
4. Publish directory: `dist`

### Backend (Convex)
1. Run `npx convex deploy`
2. Follow prompts to create production deployment
3. Update frontend env vars with production Convex URL

## Support

For issues or questions:
- Check the documentation in `/docs`
- Review AI instruction files for customization options
- Consult Convex and Supabase documentation

## License
See LICENSE file for details.
