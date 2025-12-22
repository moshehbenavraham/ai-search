import { Check, Copy, ExternalLink, Link2, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { useSaveToItems } from "@/hooks/useSaveToItems"
import { mapMapResultsToItem } from "@/lib/tavily-mappers"

interface MapResultsListProps {
  urls: string[]
  baseUrl: string
}

function extractPath(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.pathname || "/"
  } catch {
    return url
  }
}

export function MapResultsList({ urls, baseUrl }: MapResultsListProps) {
  const [copiedText, copy] = useCopyToClipboard()
  const saveToItems = useSaveToItems()

  const handleCopyUrl = async (url: string) => {
    const success = await copy(url)
    if (success) {
      toast.success("URL copied to clipboard")
    } else {
      toast.error("Failed to copy URL")
    }
  }

  const handleCopyAll = async () => {
    const allUrls = urls.join("\n")
    const success = await copy(allUrls)
    if (success) {
      toast.success(`${urls.length} URLs copied to clipboard`)
    } else {
      toast.error("Failed to copy URLs")
    }
  }

  const handleSaveAll = () => {
    const item = mapMapResultsToItem(urls, baseUrl)
    saveToItems.mutate(item)
  }

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" />
          <h3 className="font-body text-sm font-semibold text-foreground">
            Discovered URLs
          </h3>
          <Badge variant="secondary" className="font-mono text-xs">
            {urls.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyAll}
            className="h-8 gap-1.5 text-xs"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy All
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSaveAll}
            disabled={saveToItems.isPending}
            className="h-8 gap-1.5 text-xs"
          >
            {saveToItems.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save All
          </Button>
        </div>
      </div>

      {/* URL list */}
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="max-h-96 overflow-y-auto">
          <ul className="divide-y divide-border">
            {urls.map((url, index) => {
              const path = extractPath(url)
              const isCopied = copiedText === url

              return (
                <li
                  key={index}
                  className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-1"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-2 font-mono text-[10px] text-muted-foreground">
                    {index + 1}
                  </span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 flex-1 truncate font-mono text-xs text-foreground transition-colors hover:text-primary"
                    title={url}
                  >
                    {path}
                  </a>
                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(url)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                      aria-label="Copy URL to clipboard"
                    >
                      {isCopied ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                      aria-label="Open URL in new tab"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default MapResultsList
