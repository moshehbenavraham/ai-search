import type { SearchResult } from "@/client/types.gen"

import { SearchResultCard } from "./SearchResultCard"

interface SearchResultsListProps {
  results: SearchResult[]
  onResultClick?: (result: SearchResult) => void
}

export function SearchResultsList({
  results,
  onResultClick,
}: SearchResultsListProps) {
  if (results.length === 0) {
    return null
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {results.map((result, index) => (
        <SearchResultCard
          key={`${result.url}-${index}`}
          result={result}
          onClick={() => onResultClick?.(result)}
        />
      ))}
    </div>
  )
}

export default SearchResultsList
