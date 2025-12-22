import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  Save,
} from "lucide-react"
import { useState } from "react"

import type { CrawlResult } from "@/client/types.gen"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSaveToItems } from "@/hooks/useSaveToItems"
import { mapCrawlResultToItem } from "@/lib/tavily-mappers"
import { cn } from "@/lib/utils"

const CONTENT_PREVIEW_LENGTH = 500

interface CrawlResultCardProps {
  result: CrawlResult
  index: number
  baseUrl: string
}

function extractPath(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.pathname || "/"
  } catch {
    return url.slice(0, 40)
  }
}

export function CrawlResultCard({
  result,
  index,
  baseUrl,
}: CrawlResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const saveToItems = useSaveToItems()

  const content = result.raw_content || ""
  const needsTruncation = content.length > CONTENT_PREVIEW_LENGTH
  const displayContent =
    needsTruncation && !isExpanded
      ? `${content.slice(0, CONTENT_PREVIEW_LENGTH)}...`
      : content
  const charCount = content.length
  const path = extractPath(result.url)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    const item = mapCrawlResultToItem(result, baseUrl, index)
    saveToItems.mutate(item)
  }

  return (
    <article className="relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-border-strong hover:shadow-luxury-sm">
      {/* Left accent with page number */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary/60 to-primary/20" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-semibold text-primary">
            {index + 1}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span
                className="truncate font-mono text-xs text-muted-foreground"
                title={result.url}
              >
                {path}
              </span>
            </div>
          </div>
        </div>
        {content && (
          <Badge variant="secondary" className="shrink-0 font-mono text-xs">
            {charCount > 1000 ? `${Math.round(charCount / 1000)}k` : charCount}{" "}
            chars
          </Badge>
        )}
      </div>

      {/* Content */}
      {content ? (
        <div
          className={cn(
            "mt-4 whitespace-pre-wrap rounded-lg bg-surface-1 p-4 font-mono text-xs leading-relaxed text-muted-foreground",
            !isExpanded && needsTruncation && "max-h-40 overflow-hidden",
          )}
        >
          {displayContent}
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-surface-1 p-4">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-body-sm italic text-muted-foreground">
            No content extracted from this page.
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {needsTruncation && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-3 text-xs"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Show all
              </>
            )}
          </Button>
        )}
        {content && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-3 text-xs"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-success" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-3 text-xs"
          onClick={() =>
            window.open(result.url, "_blank", "noopener,noreferrer")
          }
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Visit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-3 text-xs"
          onClick={handleSave}
          disabled={saveToItems.isPending}
        >
          {saveToItems.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save
        </Button>
      </div>
    </article>
  )
}

export default CrawlResultCard
