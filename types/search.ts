export type SearchResultType = 'sheet' | 'video'

export interface SearchResult {
    id: string
    title: string
    url: string
    type: SearchResultType
    thumbnail?: string
    description?: string
}

export interface SearchResponse {
    results: SearchResult[]
    query: string
    totalResults: number
}
