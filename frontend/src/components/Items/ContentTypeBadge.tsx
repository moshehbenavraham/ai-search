import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type ContentType = "search" | "extract" | "crawl" | "map" | null | undefined

interface ContentTypeBadgeProps {
  contentType: ContentType
}

const CONTENT_TYPE_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  search: {
    label: "Search",
    className:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  },
  extract: {
    label: "Extract",
    className:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  },
  crawl: {
    label: "Crawl",
    className:
      "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  },
  map: {
    label: "Map",
    className:
      "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  },
}

export function ContentTypeBadge({ contentType }: ContentTypeBadgeProps) {
  if (!contentType) {
    return (
      <Badge variant="secondary" className="text-muted-foreground">
        Manual
      </Badge>
    )
  }

  const config = CONTENT_TYPE_CONFIG[contentType]
  if (!config) {
    return (
      <Badge variant="secondary" className="text-muted-foreground">
        Unknown
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className={cn(config.className)}>
      {config.label}
    </Badge>
  )
}
