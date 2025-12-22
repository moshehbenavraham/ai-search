import { FileStack } from "lucide-react"

import type { CrawlResult } from "@/client/types.gen"
import { Badge } from "@/components/ui/badge"

import { CrawlResultCard } from "./CrawlResultCard"

interface CrawlResultsListProps {
  results: CrawlResult[]
  baseUrl: string
}

export function CrawlResultsList({ results, baseUrl }: CrawlResultsListProps) {
  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-1 p-8 text-center">
        <p className="text-body-sm text-muted-foreground">
          No pages were crawled from this URL.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <FileStack className="h-4 w-4 text-primary" />
        <h3 className="font-body text-sm font-semibold text-foreground">
          Crawled Pages
        </h3>
        <Badge variant="secondary" className="font-mono text-xs">
          {results.length}
        </Badge>
      </div>

      {/* Scrollable results */}
      <div className="max-h-[600px] space-y-4 overflow-y-auto pr-2">
        {results.map((result, index) => (
          <CrawlResultCard
            key={result.url}
            result={result}
            index={index}
            baseUrl={baseUrl}
          />
        ))}
      </div>
    </div>
  )
}

export default CrawlResultsList
