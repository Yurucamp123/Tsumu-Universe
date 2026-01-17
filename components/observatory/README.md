# Observatory Module - Environment Setup

## YouTube API Key

To enable real YouTube search, you need to add a YouTube Data API v3 key to your environment variables.

### Steps:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable "YouTube Data API v3"
4. Create credentials (API Key)
5. Add the key to your `.env.local` file:

```bash
YOUTUBE_API_KEY=your_api_key_here
```

### Free Tier Limits:
- 10,000 requests per day
- Each search costs ~100 units
- ~100 searches per day for free

### Alternative (No API Key):
If you don't add an API key, the search will still work but only return Musescore links.
