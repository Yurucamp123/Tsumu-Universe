import { NextResponse } from 'next/server'

const CHANNEL_ID = 'UCiWwCOCTHfUe_V_-Pqknz-w' // @uta.uta_p channel ID

// Color palette for videos (20 colors for variety)
const COLORS = [
    'rgb(100, 149, 237)', // Cornflower Blue
    'rgb(144, 238, 144)', // Light Green
    'rgb(255, 160, 122)', // Light Salmon
    'rgb(255, 182, 193)', // Light Pink
    'rgb(135, 206, 250)', // Sky Blue
    'rgb(255, 255, 255)', // White
    'rgb(59, 130, 246)',  // Blue
    'rgb(167, 139, 250)', // Medium Purple
    'rgb(255, 215, 0)',   // Gold
    'rgb(196, 181, 253)', // Lavender
    'rgb(251, 146, 60)',  // Orange
    'rgb(239, 68, 68)',   // Red
    'rgb(147, 197, 253)', // Light Blue
    'rgb(134, 239, 172)', // Light Green
    'rgb(251, 207, 232)', // Pink
    'rgb(253, 224, 71)',  // Yellow
    'rgb(165, 180, 252)', // Indigo
    'rgb(252, 165, 165)', // Light Red
    'rgb(216, 180, 254)', // Purple
    'rgb(134, 239, 172)', // Mint Green
]

export async function GET() {
    try {
        // Fetch YouTube RSS feed (no API key needed!)
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`
        const response = await fetch(rssUrl, {
            next: { revalidate: 3600 } // Cache for 1 hour
        })

        if (!response.ok) {
            throw new Error('Failed to fetch RSS feed')
        }

        const xmlText = await response.text()

        // Parse XML to extract video data
        const videos = parseYouTubeRSS(xmlText)

        // Transform to Song format
        const songs = videos
            .slice(0, 20) // Limit to 20 songs
            .map((video, index) => ({
                id: video.videoId,
                title: video.title.replace(/#shorts?/gi, '').trim(),
                artist: 'つむ (Tsumu)',
                color: COLORS[index % COLORS.length],
                description: video.description || 'Piano cover',
                tiktokUrl: 'https://www.tiktok.com/@uta.uta_p',
                youtubeUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
                thumbnail: video.thumbnail,
                publishedAt: video.publishedAt,
            }))

        return NextResponse.json(songs)
    } catch (error) {
        console.error('Error fetching YouTube RSS:', error)
        return NextResponse.json(
            { error: 'Failed to fetch videos', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}

// Simple XML parser for YouTube RSS feed
function parseYouTubeRSS(xml: string) {
    const videos: Array<{
        videoId: string
        title: string
        description: string
        thumbnail: string
        publishedAt: string
    }> = []

    // Extract entries using regex (simple approach)
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
    const entries = xml.match(entryRegex) || []

    for (const entry of entries) {
        // Extract video ID
        const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)
        const videoId = videoIdMatch ? videoIdMatch[1] : ''

        // Extract title
        const titleMatch = entry.match(/<title>(.*?)<\/title>/)
        const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/, '$1') : ''

        // Extract published date
        const publishedMatch = entry.match(/<published>(.*?)<\/published>/)
        const publishedAt = publishedMatch ? publishedMatch[1] : ''

        // Extract description
        const descMatch = entry.match(/<media:description>(.*?)<\/media:description>/)
        const description = descMatch ? descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/, '$1') : ''

        // Extract thumbnail
        const thumbnailMatch = entry.match(/<media:thumbnail url="(.*?)"/)
        const thumbnail = thumbnailMatch ? thumbnailMatch[1] : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`

        if (videoId && title) {
            videos.push({
                videoId,
                title,
                description,
                thumbnail,
                publishedAt,
            })
        }
    }

    return videos
}
