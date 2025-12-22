import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  Save,
} from "lucide-react"
import { useState } from "react"

import type { ExtractResult } from "@/client/types.gen"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSaveToItems } from "@/hooks/useSaveToItems"
import { mapExtractResultToItem } from "@/lib/tavily-mappers"
import { cn } from "@/lib/utils"

// Maximum characters to show in collapsed state
const CONTENT_PREVIEW_LENGTH = 500

interface SuccessResultProps {
  type: "success"
  result: ExtractResult
}

interface FailedResultProps {
  type: "failed"
  url: string
  error?: string
}

export type ExtractResultCardProps = SuccessResultProps | FailedResultProps

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

export function ExtractResultCard(props: ExtractResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const saveToItems = useSaveToItems()

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    if (props.type === "success") {
      const item = mapExtractResultToItem(props.result)
      saveToItems.mutate(item)
    }
  }

  // Failed state
  if (props.type === "failed") {
    const domain = extractDomain(props.url)

    return (
      <article className="relative overflow-hidden rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        {/* Left accent bar */}
        <div className="absolute left-0 top-0 h-full w-1 bg-destructive" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
              <AlertCircle className="h-4.5 w-4.5 text-destructive" />
            </div>
            <div>
              <h4 className="font-body text-sm font-semibold text-foreground">
                Extraction Failed
              </h4>
              <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span className="font-mono text-xs">{domain}</span>
              </div>
            </div>
          </div>
          <Badge variant="destructive" className="shrink-0">
            Failed
          </Badge>
        </div>

        <p className="mt-3 text-body-sm text-muted-foreground">
          {props.error || "Unable to extract content from this URL."}
        </p>

        <Button
          variant="ghost"
          size="sm"
          className="mt-3 h-8 gap-1.5 px-3 text-xs"
          onClick={() =>
            window.open(props.url, "_blank", "noopener,noreferrer")
          }
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Visit URL
        </Button>
      </article>
    )
  }

  // Success state
  const { result } = props
  const domain = extractDomain(result.url)
  const content = result.raw_content || ""
  const needsTruncation = content.length > CONTENT_PREVIEW_LENGTH
  const displayContent =
    needsTruncation && !isExpanded
      ? `${content.slice(0, CONTENT_PREVIEW_LENGTH)}...`
      : content
  const charCount = content.length

  return (
    <article className="relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-border-strong hover:shadow-luxury-sm">
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-success to-success/30" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success/10">
            <Check className="h-4.5 w-4.5 text-success" />
          </div>
          <div>
            <h4 className="font-body text-sm font-semibold text-foreground">
              Extracted Content
            </h4>
            <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span className="font-mono text-xs">{domain}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs">
            {charCount > 1000
              ? `${Math.round(charCount / 1000)}k chars`
              : `${charCount} chars`}
          </Badge>
          <Badge variant="success" className="shrink-0">
            Success
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          "mt-4 whitespace-pre-wrap rounded-lg bg-surface-1 p-4 font-mono text-xs leading-relaxed text-muted-foreground",
          !isExpanded && needsTruncation && "max-h-48 overflow-hidden",
        )}
      >
        {displayContent}
      </div>

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
                Show all content
              </>
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-3 text-xs"
          onClick={() => handleCopy(content)}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-success" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy content
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-3 text-xs"
          onClick={() =>
            window.open(result.url, "_blank", "noopener,noreferrer")
          }
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Visit URL
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

export default ExtractResultCard
