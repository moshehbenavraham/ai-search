import { ArrowUpRight, ExternalLink, Globe, Loader2, Save } from "lucide-react"

import type { SearchResult } from "@/client/types.gen"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSaveToItems } from "@/hooks/useSaveToItems"
import { mapSearchResultToItem } from "@/lib/tavily-mappers"
import { cn } from "@/lib/utils"

interface SearchResultCardProps {
  result: SearchResult
  query: string
  onClick?: () => void
}

/**
 * Extract domain from URL for display
 */
function extractDomain(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/^www\./, "")
  } catch {
    return url.slice(0, 30)
  }
}

/**
 * Get badge variant based on relevance score
 */
function getScoreVariant(score: number): "success" | "warning" | "destructive" {
  if (score >= 0.7) return "success"
  if (score >= 0.4) return "warning"
  return "destructive"
}

/**
 * Truncate text with ellipsis
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1)}...`
}

export function SearchResultCard({
  result,
  query,
  onClick,
}: SearchResultCardProps) {
  const scorePercent = Math.round(result.score * 100)
  const domain = extractDomain(result.url)
  const saveToItems = useSaveToItems()

  const handleOpenUrl = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(result.url, "_blank", "noopener,noreferrer")
  }

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    const item = mapSearchResultToItem(result, query)
    saveToItems.mutate(item)
  }

  return (
    <article
      className={cn(
        "group relative rounded-xl border border-border bg-card p-5",
        "cursor-pointer transition-all duration-200",
        "hover:border-border-strong hover:bg-surface-1 hover:shadow-luxury-sm",
        "hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick?.()
        }
      }}
      aria-label={`View details for ${result.title}`}
    >
      {/* Header Row */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-body text-[15px] font-semibold leading-snug text-foreground group-hover:text-primary transition-colors duration-200">
            {truncate(result.title, 70)}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5 text-muted-foreground">
            <Globe className="h-3.5 w-3.5 shrink-0" />
            <span className="font-mono text-xs tracking-tight">{domain}</span>
          </div>
        </div>
        <Badge
          variant={getScoreVariant(result.score)}
          className="shrink-0 font-mono text-xs tabular-nums"
        >
          {scorePercent}%
        </Badge>
      </div>

      {/* Content Snippet */}
      <p className="mb-4 text-body-sm leading-relaxed text-muted-foreground line-clamp-2">
        {result.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenUrl}
            className="h-8 gap-1.5 px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Visit site
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={saveToItems.isPending}
            className="h-8 gap-1.5 px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {saveToItems.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save
          </Button>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span>View details</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </article>
  )
}

export default SearchResultCard
