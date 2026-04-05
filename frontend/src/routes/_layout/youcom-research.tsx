import { createFileRoute } from "@tanstack/react-router"
import { BrainCircuit, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

import type {
  YouComDeepResearchRequest,
  YouComDeepResearchResponse,
} from "@/client/types.gen"
import { Card, CardContent } from "@/components/ui/card"
import { YouComDeepResearchForm, YouComResultView } from "@/components/YouCom"
import { useYouComDeepResearch } from "@/hooks/useYouComDeepResearch"

export const Route = createFileRoute("/_layout/youcom-research")({
  component: YouComResearchPage,
  head: () => ({
    meta: [{ title: "You.com Research - AI Search" }],
  }),
})

function YouComResearchPage() {
  const [result, setResult] = useState<YouComDeepResearchResponse | null>(null)
  const [lastRequest, setLastRequest] =
    useState<YouComDeepResearchRequest | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const mutation = useYouComDeepResearch({
    onSuccess: (data) => {
      setResult(data)
    },
  })

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (mutation.isPending) {
      setElapsedSeconds(0)
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
  }, [mutation.isPending])

  const handleSubmit = (request: YouComDeepResearchRequest) => {
    setLastRequest(request)
    setResult(null)
    mutation.mutate(request)
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="page-enter space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <BrainCircuit className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-display-lg font-medium tracking-tight">
              You.com Research
            </h1>
          </div>
        </div>
        <p className="max-w-2xl text-body text-muted-foreground">
          Run comprehensive synchronous research with citations. It is slower
          than standard Tavily search, but you get a finished markdown report
          without a background job or polling loop.
        </p>
      </header>

      <Card className="page-enter-child" variant="elevated">
        <CardContent className="pt-6">
          <YouComDeepResearchForm
            onSubmit={handleSubmit}
            isLoading={mutation.isPending}
          />
        </CardContent>
      </Card>

      {mutation.isPending && (
        <Card className="page-enter-child" variant="muted">
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium">Researching...</p>
                <p className="text-sm text-muted-foreground">
                  You.com research completes in one request and may take a bit
                  longer for deeper effort tiers.
                </p>
                <p className="mt-2 font-mono text-lg text-primary">
                  {elapsedSeconds}s
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result && !mutation.isPending && lastRequest && (
        <div className="page-enter-child">
          <YouComResultView
            response={result}
            query={lastRequest.query}
            researchEffort={lastRequest.research_effort}
          />
        </div>
      )}

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
