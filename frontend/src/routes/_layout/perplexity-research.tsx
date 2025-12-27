import { createFileRoute } from "@tanstack/react-router"
import { Loader2, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

import type { PerplexityDeepResearchResponse } from "@/client/types.gen"
import {
  PerplexityDeepResearchForm,
  PerplexityResultView,
} from "@/components/Perplexity"
import { Card, CardContent } from "@/components/ui/card"
import { usePerplexityDeepResearch } from "@/hooks/usePerplexityDeepResearch"

export const Route = createFileRoute("/_layout/perplexity-research")({
  component: PerplexityResearchPage,
  head: () => ({
    meta: [{ title: "Perplexity Research - Tavily App" }],
  }),
})

function PerplexityResearchPage() {
  const [result, setResult] = useState<PerplexityDeepResearchResponse | null>(
    null,
  )
  const [lastQuery, setLastQuery] = useState("")
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const mutation = usePerplexityDeepResearch({
    onSuccess: (data) => {
      setResult(data)
      setElapsedSeconds(0)
    },
  })

  // Elapsed time counter during loading
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (mutation.isPending) {
      setElapsedSeconds(0)
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [mutation.isPending])

  const handleResearchComplete = (data: unknown) => {
    setResult(data as PerplexityDeepResearchResponse)
  }

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
              Perplexity Research
            </h1>
          </div>
        </div>
        <p className="max-w-2xl text-body text-muted-foreground">
          Conduct deep research using Perplexity's Sonar API. Get comprehensive
          answers with citations and source references.
        </p>
      </header>

      {/* Research Form */}
      <Card className="page-enter-child" variant="elevated">
        <CardContent className="pt-6">
          <PerplexityDeepResearchForm
            onResearchComplete={handleResearchComplete}
            onQuerySubmit={setLastQuery}
            isLoading={mutation.isPending}
          />
        </CardContent>
      </Card>

      {/* Loading State with Elapsed Time */}
      {mutation.isPending && (
        <Card className="page-enter-child" variant="muted">
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium">Researching...</p>
                <p className="text-sm text-muted-foreground">
                  Deep research queries typically take 30-60 seconds
                </p>
                <p className="mt-2 font-mono text-lg text-primary">
                  {elapsedSeconds}s
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && !mutation.isPending && (
        <div className="page-enter-child">
          <PerplexityResultView response={result} query={lastQuery} />
        </div>
      )}

      {/* Error State */}
      {mutation.isError && !mutation.isPending && (
        <Card className="page-enter-child border-destructive" variant="muted">
          <CardContent className="py-6">
            <div className="text-center">
              <p className="font-medium text-destructive">Research Failed</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {mutation.error?.message ||
                  "An error occurred while processing your request."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
