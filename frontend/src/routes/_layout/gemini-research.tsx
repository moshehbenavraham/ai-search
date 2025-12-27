import { createFileRoute } from "@tanstack/react-router"
import { Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

import type {
  GeminiDeepResearchRequest,
  GeminiDeepResearchResultResponse,
  GeminiInteractionStatus,
} from "@/client/types.gen"
import {
  GeminiCancelButton,
  GeminiDeepResearchForm,
  GeminiErrorDisplay,
  GeminiProgressIndicator,
  GeminiResultView,
} from "@/components/Gemini"
import { Card, CardContent } from "@/components/ui/card"
import {
  isTerminalStatus,
  useGeminiCancelResearch,
  useGeminiPollResearch,
  useGeminiStartResearch,
} from "@/hooks/useGeminiDeepResearch"

export const Route = createFileRoute("/_layout/gemini-research")({
  component: GeminiResearchPage,
  head: () => ({
    meta: [{ title: "Gemini Research - Tavily App" }],
  }),
})

// Page state machine states
type PageState = "idle" | "polling" | "completed" | "failed" | "cancelled"

function GeminiResearchPage() {
  // State machine
  const [pageState, setPageState] = useState<PageState>("idle")

  // Polling state
  const [interactionId, setInteractionId] = useState<string | null>(null)
  const [lastEventId, setLastEventId] = useState<string | null>(null)

  // Query tracking for save functionality
  const [lastQuery, setLastQuery] = useState("")

  // Result state
  const [result, setResult] = useState<GeminiDeepResearchResultResponse | null>(
    null,
  )

  // Elapsed time tracking
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // Error state
  const [error, setError] = useState<Error | null>(null)

  // Current status for display
  const [currentStatus, setCurrentStatus] =
    useState<GeminiInteractionStatus>("pending")

  // Start research mutation
  const startMutation = useGeminiStartResearch({
    onSuccess: (data) => {
      setInteractionId(data.interaction_id)
      setCurrentStatus(data.status ?? "pending")
      setPageState("polling")
      setError(null)
      setResult(null)
    },
    onError: (err) => {
      setError(err)
      setPageState("failed")
    },
  })

  // Poll research query
  const pollQuery = useGeminiPollResearch({
    interactionId,
    lastEventId,
    enabled: pageState === "polling" && !!interactionId,
    onSuccess: (data) => {
      // Update last event ID for reconnection
      if (data.event_id) {
        setLastEventId(data.event_id)
      }

      // Update current status
      setCurrentStatus(data.status)

      // Check for terminal status
      if (isTerminalStatus(data.status)) {
        setResult(data)

        if (data.status === "completed") {
          setPageState("completed")
        } else if (data.status === "failed") {
          setError(new Error("Research job failed"))
          setPageState("failed")
        } else if (data.status === "cancelled") {
          setPageState("cancelled")
        }
      }
    },
  })

  // Cancel research mutation
  const cancelMutation = useGeminiCancelResearch({
    onSuccess: () => {
      setPageState("cancelled")
    },
    onError: (err) => {
      setError(err)
    },
  })

  // Elapsed time counter during polling
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (pageState === "polling") {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      setElapsedSeconds(0)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [pageState])

  // Handle form submission
  const handleSubmit = (data: GeminiDeepResearchRequest) => {
    // Reset state
    setError(null)
    setResult(null)
    setInteractionId(null)
    setLastEventId(null)
    setElapsedSeconds(0)
    setCurrentStatus("pending")
    setLastQuery(data.query)

    // Start research
    startMutation.mutate(data)
  }

  // Handle cancel
  const handleCancel = () => {
    if (interactionId) {
      cancelMutation.mutate(interactionId)
    }
  }

  // Handle retry
  const handleRetry = () => {
    setPageState("idle")
    setError(null)
    setResult(null)
    setInteractionId(null)
    setLastEventId(null)
  }

  // Determine if form should be disabled
  const isFormDisabled = pageState === "polling" || startMutation.isPending

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <header className="page-enter space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-display-lg font-medium tracking-tight">
              Gemini Research
            </h1>
          </div>
        </div>
        <p className="max-w-2xl text-body text-muted-foreground">
          Conduct deep research using Google Gemini. Comprehensive research can
          take up to 60 minutes for complex queries.
        </p>
      </header>

      {/* Research Form */}
      <Card className="page-enter-child" variant="elevated">
        <CardContent className="pt-6">
          <GeminiDeepResearchForm
            onSubmit={handleSubmit}
            isLoading={startMutation.isPending}
            disabled={isFormDisabled}
          />
        </CardContent>
      </Card>

      {/* Polling State with Progress and Cancel */}
      {pageState === "polling" && (
        <div className="page-enter-child space-y-4">
          <GeminiProgressIndicator
            status={currentStatus}
            elapsedSeconds={elapsedSeconds}
          />
          <div className="flex justify-center">
            <GeminiCancelButton
              onCancel={handleCancel}
              isLoading={cancelMutation.isPending}
              disabled={cancelMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Cancelled State */}
      {pageState === "cancelled" && (
        <Card className="page-enter-child" variant="muted">
          <CardContent className="py-6">
            <div className="text-center">
              <p className="font-medium text-muted-foreground">
                Research Cancelled
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                The research job was cancelled. You can start a new query above.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {pageState === "failed" && (
        <div className="page-enter-child">
          <GeminiErrorDisplay error={error} onRetry={handleRetry} />
        </div>
      )}

      {/* Results */}
      {pageState === "completed" && result && interactionId && (
        <div className="page-enter-child">
          <GeminiResultView
            response={result}
            query={lastQuery}
            interactionId={interactionId}
          />
        </div>
      )}

      {/* Polling Error (non-terminal) */}
      {pollQuery.error && pageState === "polling" && (
        <Card className="page-enter-child border-yellow-500" variant="muted">
          <CardContent className="py-4">
            <p className="text-center text-sm text-yellow-600 dark:text-yellow-400">
              Polling error: {pollQuery.error.message}. Retrying...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
