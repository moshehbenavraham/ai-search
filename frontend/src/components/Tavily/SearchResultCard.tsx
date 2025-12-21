import { ExternalLink, Globe } from "lucide-react"

import type { SearchResult } from "@/client/types.gen"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SearchResultCardProps {
  result: SearchResult
  onClick?: () => void
}

/**
 * Truncate URL to show domain and partial path.
 * Preserves protocol and domain, truncates path to ~50 chars total.
 */
function truncateUrl(url: string, maxLength = 50): string {
  if (url.length <= maxLength) {
    return url
  }

  try {
    const parsed = new URL(url)
    const domain = parsed.hostname
    const path = parsed.pathname + parsed.search

    // Always show domain
    if (domain.length >= maxLength - 3) {
      return `${domain.slice(0, maxLength - 3)}...`
    }

    const remainingLength = maxLength - domain.length - 3
    if (path.length > remainingLength) {
      return `${domain + path.slice(0, remainingLength)}...`
    }

    return domain + path
  } catch {
    // Fallback for invalid URLs
    return `${url.slice(0, maxLength - 3)}...`
  }
}

/**
 * Get badge styling based on relevance score.
 * Green >= 0.7, Yellow >= 0.4, Red < 0.4
 */
function getScoreBadgeStyle(score: number): string {
  if (score >= 0.7) {
    return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
  }
  if (score >= 0.4) {
    return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
  }
  return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
}

/**
 * Truncate title to prevent overflow
 */
function truncateTitle(title: string, maxLength = 60): string {
  if (title.length <= maxLength) {
    return title
  }
  return `${title.slice(0, maxLength - 3)}...`
}

/**
 * Truncate content snippet
 */
function truncateContent(content: string, maxLength = 150): string {
  if (content.length <= maxLength) {
    return content
  }
  return `${content.slice(0, maxLength - 3)}...`
}

export function SearchResultCard({ result, onClick }: SearchResultCardProps) {
  const scorePercent = Math.round(result.score * 100)

  const handleOpenUrl = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(result.url, "_blank", "noopener,noreferrer")
  }

  return (
    <Card
      className={cn(
        "cursor-pointer py-4 transition-colors hover:bg-accent/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick?.()
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${result.title}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">
            {truncateTitle(result.title)}
          </CardTitle>
          <Badge className={cn("shrink-0", getScoreBadgeStyle(result.score))}>
            {scorePercent}%
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1.5">
          <Globe className="h-3 w-3 shrink-0" />
          <span className="truncate text-xs">{truncateUrl(result.url)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {truncateContent(result.content)}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenUrl}
          className="gap-1.5"
        >
          <ExternalLink className="h-3 w-3" />
          Open URL
        </Button>
      </CardContent>
    </Card>
  )
}

export default SearchResultCard
