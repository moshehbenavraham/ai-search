import { AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface GeminiErrorDisplayProps {
  error: Error | null
  onRetry?: () => void
}

export function GeminiErrorDisplay({
  error,
  onRetry,
}: GeminiErrorDisplayProps) {
  if (!error) {
    return null
  }

  return (
    <Card className="border-destructive" variant="muted">
      <CardContent className="py-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="font-medium text-destructive">Research Failed</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error.message ||
                "An error occurred while processing your request."}
            </p>
          </div>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default GeminiErrorDisplay
