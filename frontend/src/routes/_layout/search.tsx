import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
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
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <header className="page-enter space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Search className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-display-lg font-medium tracking-tight">
              Web Search
            </h1>
          </div>
        </div>
        <p className="max-w-2xl text-body text-muted-foreground">
          Search the web using Tavily's AI-powered search engine. Get relevant
          results with optional AI-generated answers and images.
        </p>
      </header>

      {/* Search Configuration Card */}
      <Card className="page-enter-child" variant="elevated">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-heading">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Search Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SearchForm mutation={mutation} />
        </CardContent>
      </Card>

      {/* Loading skeleton */}
      {showSkeleton && (
        <Card className="page-enter-child" variant="default">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-heading">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              Searching...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SearchSkeleton count={6} />
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {showEmptyState && (
        <Card className="page-enter-child" variant="default">
          <CardContent className="py-8">
            <SearchEmptyState query={searchResults.query} />
          </CardContent>
        </Card>
      )}

      {/* Search results */}
      {hasResults && !mutation.isPending && (
        <Card className="page-enter-child" variant="elevated">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-heading">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Search Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SearchMetadata
              query={searchResults.query}
              resultCount={searchResults.results?.length ?? 0}
              answer={searchResults.answer}
            />

            <div className="separator-elegant" />

            <SearchResultsList
              results={searchResults.results ?? []}
              query={searchResults.query}
              onResultClick={handleResultClick}
            />
          </CardContent>
        </Card>
      )}

      {/* Image results */}
      {hasImages && !mutation.isPending && (
        <div className="page-enter-child">
          <SearchImageGrid images={searchResults.images ?? []} />
        </div>
      )}

      {/* Detail dialog */}
      <SearchResultDetail
        result={selectedResult}
        query={searchResults?.query ?? ""}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
