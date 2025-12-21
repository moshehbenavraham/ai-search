import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import type { SearchResponse, SearchResult } from "@/client/types.gen"
import { SearchEmptyState } from "@/components/Tavily/SearchEmptyState"
import { SearchForm } from "@/components/Tavily/SearchForm"
import { SearchImageGrid } from "@/components/Tavily/SearchImageGrid"
import { SearchMetadata } from "@/components/Tavily/SearchMetadata"
import { SearchResultDetail } from "@/components/Tavily/SearchResultDetail"
import { SearchResultsList } from "@/components/Tavily/SearchResultsList"
import { SearchSkeleton } from "@/components/Tavily/SearchSkeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTavilySearch } from "@/hooks/useTavilySearch"

export const Route = createFileRoute("/_layout/search")({
  component: SearchPage,
  head: () => ({
    meta: [{ title: "Search - Tavily App" }],
  }),
})

function SearchPage() {
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(
    null,
  )
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(
    null,
  )
  const [detailOpen, setDetailOpen] = useState(false)

  const mutation = useTavilySearch({
    onSuccess: (data) => {
      setSearchResults(data)
    },
  })

  const handleResultClick = (result: SearchResult) => {
    setSelectedResult(result)
    setDetailOpen(true)
  }

  const hasResults = searchResults?.results && searchResults.results.length > 0
  const hasImages = searchResults?.images && searchResults.images.length > 0
  const showEmptyState = searchResults && !hasResults && !mutation.isPending
  const showSkeleton = mutation.isPending

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Web Search</h1>
        <p className="text-muted-foreground">
          Search the web using Tavily AI-powered search
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchForm mutation={mutation} />
        </CardContent>
      </Card>

      {/* Loading skeleton */}
      {showSkeleton && (
        <Card>
          <CardHeader>
            <CardTitle>Searching...</CardTitle>
          </CardHeader>
          <CardContent>
            <SearchSkeleton count={6} />
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {showEmptyState && (
        <Card>
          <CardContent className="pt-6">
            <SearchEmptyState query={searchResults.query} />
          </CardContent>
        </Card>
      )}

      {/* Search results */}
      {hasResults && !mutation.isPending && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SearchMetadata
              query={searchResults.query}
              resultCount={searchResults.results?.length ?? 0}
              answer={searchResults.answer}
            />

            <SearchResultsList
              results={searchResults.results ?? []}
              onResultClick={handleResultClick}
            />
          </CardContent>
        </Card>
      )}

      {/* Image results */}
      {hasImages && !mutation.isPending && (
        <SearchImageGrid images={searchResults.images ?? []} />
      )}

      {/* Detail dialog */}
      <SearchResultDetail
        result={selectedResult}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
