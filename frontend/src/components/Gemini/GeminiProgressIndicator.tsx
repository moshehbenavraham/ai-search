import { Loader2 } from "lucide-react"

import type { GeminiInteractionStatus } from "@/client/types.gen"
import { Card, CardContent } from "@/components/ui/card"

interface GeminiProgressIndicatorProps {
  status: GeminiInteractionStatus
  elapsedSeconds: number
}

// Format elapsed time as MM:SS
function formatElapsedTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

// Get status display text
function getStatusText(status: GeminiInteractionStatus): string {
  switch (status) {
    case "pending":
      return "Initializing research..."
    case "running":
      return "Researching..."
    default:
      return "Processing..."
  }
}

// Get encouraging message based on elapsed time
function getEncouragingMessage(seconds: number): string {
  if (seconds < 30) {
    return "Deep research queries can take several minutes"
  }
  if (seconds < 120) {
    return "Gathering and analyzing information..."
  }
  if (seconds < 300) {
    return "Comprehensive research takes time - hang in there!"
  }
  if (seconds < 600) {
    return "Still working hard on your research..."
  }
  return "Deep research can take up to 60 minutes for complex queries"
}

export function GeminiProgressIndicator({
  status,
  elapsedSeconds,
}: GeminiProgressIndicatorProps) {
  return (
    <Card variant="muted">
      <CardContent className="py-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium">{getStatusText(status)}</p>
            <p className="text-sm text-muted-foreground">
              {getEncouragingMessage(elapsedSeconds)}
            </p>
            <p className="mt-2 font-mono text-lg text-primary">
              {formatElapsedTime(elapsedSeconds)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default GeminiProgressIndicator
