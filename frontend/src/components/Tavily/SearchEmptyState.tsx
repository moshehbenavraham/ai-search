import { Search } from "lucide-react"

interface SearchEmptyStateProps {
  query?: string
}

export function SearchEmptyState({ query }: SearchEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No results found</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {query
          ? `No results found for "${query}". Try a different search term.`
          : "Enter a search query to find results."}
      </p>
    </div>
  )
}

export default SearchEmptyState
