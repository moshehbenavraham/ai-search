import { ExternalLink } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SourceUrlCellProps {
  url: string | null | undefined
}

const MAX_URL_LENGTH = 40

function truncateUrl(url: string): string {
  if (url.length <= MAX_URL_LENGTH) {
    return url
  }
  return `${url.substring(0, MAX_URL_LENGTH)}...`
}

export function SourceUrlCell({ url }: SourceUrlCellProps) {
  if (!url) {
    return <span className="text-muted-foreground">-</span>
  }

  const isLong = url.length > MAX_URL_LENGTH
  const displayUrl = truncateUrl(url)

  const linkContent = (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
    >
      <span className="truncate max-w-[200px]">{displayUrl}</span>
      <ExternalLink className="size-3.5 shrink-0" />
    </a>
  )

  if (isLong) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-md break-all">
          {url}
        </TooltipContent>
      </Tooltip>
    )
  }

  return linkContent
}
