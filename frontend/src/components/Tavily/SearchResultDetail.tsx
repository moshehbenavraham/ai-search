import {
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  Save,
  Star,
} from "lucide-react"

import type { SearchResult } from "@/client/types.gen"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSaveToItems } from "@/hooks/useSaveToItems"
import { mapSearchResultToItem } from "@/lib/tavily-mappers"
import { cn } from "@/lib/utils"

interface SearchResultDetailProps {
  result: SearchResult | null
  query: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Get badge styling based on relevance score.
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

export function SearchResultDetail({
  result,
  query,
  open,
  onOpenChange,
}: SearchResultDetailProps) {
  const saveToItems = useSaveToItems()

  if (!result) {
    return null
  }

  const scorePercent = Math.round(result.score * 100)

  const handleOpenUrl = () => {
    window.open(result.url, "_blank", "noopener,noreferrer")
  }

  const handleSave = () => {
    const item = mapSearchResultToItem(result, query)
    saveToItems.mutate(item)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="pr-8 leading-normal">
            {result.title}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Globe className="h-3 w-3" />
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="max-w-[300px] truncate hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {result.url}
                </a>
              </Badge>
              <Badge className={cn("gap-1", getScoreBadgeStyle(result.score))}>
                <Star className="h-3 w-3" />
                {scorePercent}% relevance
              </Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto">
          {/* Content snippet */}
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" />
              Summary
            </h4>
            <p className="text-sm text-muted-foreground">{result.content}</p>
          </div>

          {/* Raw content if available */}
          {result.raw_content && (
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                Full Content
              </h4>
              <div className="max-h-[40vh] overflow-y-auto rounded-md border bg-muted/50 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {result.raw_content}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            variant="secondary"
            onClick={handleSave}
            disabled={saveToItems.isPending}
            className="gap-1.5"
          >
            {saveToItems.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </Button>
          <Button onClick={handleOpenUrl} className="gap-1.5">
            <ExternalLink className="h-4 w-4" />
            Open in New Tab
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SearchResultDetail
