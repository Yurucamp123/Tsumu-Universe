import { NextRequest, NextResponse } from 'next/server'
import type { SearchResponse, SearchResult } from '@/types/search'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get('q')

        if (!query) {
            return NextResponse.json(
                { error: 'Query parameter is required' },
                { status: 400 }
            )
        }

        const results: SearchResult[] = []

        // Generate YouTube search results (direct links, no API needed)
        const youtubeResults = generateYouTubeResults(query)
        results.push(...youtubeResults)

        // Generate Musescore search results
        const sheetResults = generateMusescoreResults(query)
        results.push(...sheetResults)

        const response: SearchResponse = {
            results,
            query,
            totalResults: results.length
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Search error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

function generateYouTubeResults(query: string): SearchResult[] {
    // Generate direct YouTube search links for common variations
    const searchVariations = [
        `${query} piano tutorial`,
        `${query} piano cover`,
        `${query} ピアノ`,
    ]

    return searchVariations.map((searchQuery, index) => ({
        id: `youtube-${index}-${Date.now()}`,
        title: `${query} - Piano Tutorial (YouTube)`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`,
        type: 'video' as const,
        description: `Search results for "${searchQuery}" on YouTube`
    }))
}

function generateMusescoreResults(query: string): SearchResult[] {
    // Generate Musescore search links
    const musescoreSearches = [
        {
            title: `${query} - Piano Sheet Music`,
            url: `https://musescore.com/sheetmusic?text=${encodeURIComponent(query)}`,
            description: 'Sheet music on Musescore.com'
        },
        {
            title: `${query} - Free Piano Sheets`,
            url: `https://www.google.com/search?q=${encodeURIComponent(query + ' piano sheet music pdf')}`,
            description: 'Google search for free piano sheets'
        }
    ]

    return musescoreSearches.map((result, index) => ({
        id: `sheet-${index}-${Date.now()}`,
        title: result.title,
        url: result.url,
        type: 'sheet' as const,
        description: result.description
    }))
}
