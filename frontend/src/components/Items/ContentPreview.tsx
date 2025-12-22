import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

interface ContentPreviewProps {
  content: string | null | undefined
  maxLength?: number
}

const DEFAULT_MAX_LENGTH = 500

export function ContentPreview({
  content,
  maxLength = DEFAULT_MAX_LENGTH,
}: ContentPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!content) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No content available
      </p>
    )
  }

  const isLong = content.length > maxLength
  const displayContent = isExpanded ? content : content.substring(0, maxLength)

  return (
    <div className="space-y-2">
      <div className="rounded-md border bg-muted/50 p-3">
        <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
          {displayContent}
          {!isExpanded && isLong && "..."}
        </pre>
      </div>
      {isLong && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 px-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="size-4 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="size-4 mr-1" />
              Show more ({content.length.toLocaleString()} characters)
            </>
          )}
        </Button>
      )}
    </div>
  )
}
