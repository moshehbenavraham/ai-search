import { createFileRoute } from "@tanstack/react-router"
import { Globe } from "lucide-react"
import { useRef, useState } from "react"

import type { CrawlResponse } from "@/client/types.gen"
import { CrawlEmptyState } from "@/components/Tavily/CrawlEmptyState"
import { CrawlForm } from "@/components/Tavily/CrawlForm"
import { CrawlMetadata } from "@/components/Tavily/CrawlMetadata"
import { CrawlResultsList } from "@/components/Tavily/CrawlResultsList"
import { CrawlSkeleton } from "@/components/Tavily/CrawlSkeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCrawl } from "@/hooks/useCrawl"

export const Route = createFileRoute("/_layout/crawl")({
  component: CrawlPage,
  head: () => ({
    meta: [{ title: "Crawl - Tavily App" }],
  }),
})

function CrawlPage() {
  const [crawlResult, setCrawlResult] = useState<CrawlResponse | null>(null)
  const [responseTime, setResponseTime] = useState<number | undefined>()
  const startTimeRef = useRef<number>(0)

  const mutation = useCrawl({
    onSuccess: (data) => {
      setResponseTime(Date.now() - startTimeRef.current)
      setCrawlResult(data)
    },
  })

  const timedMutation = {
    ...mutation,
    mutate: (request: Parameters<typeof mutation.mutate>[0]) => {
      startTimeRef.current = Date.now()
      mutation.mutate(request)
    },
  } as typeof mutation

  const results = crawlResult?.results || []
  const totalPages = crawlResult?.total_pages || results.length

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <header className="page-enter space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-display-lg font-medium tracking-tight">
              Web Crawling
            </h1>
          </div>
        </div>
        <p className="max-w-2xl text-body text-muted-foreground">
          Recursively crawl websites and extract content from discovered pages.
          Configure depth, breadth, and filtering options for precise control.
        </p>
      </header>

      {/* Form Card */}
      <Card className="page-enter-child" variant="elevated">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-heading">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Crawl Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CrawlForm mutation={timedMutation} />
        </CardContent>
      </Card>

      {/* Results Section */}
      {mutation.isPending ? (
        <Card className="page-enter-child" variant="default">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-heading">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              Crawling...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CrawlSkeleton count={3} />
          </CardContent>
        </Card>
      ) : crawlResult ? (
        <Card className="page-enter-child" variant="elevated">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-heading">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Crawl Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <CrawlMetadata
              baseUrl={crawlResult.base_url}
              totalPages={totalPages}
              responseTime={responseTime}
            />
            {results.length > 0 ? (
              <>
                <div className="separator-elegant" />
                <CrawlResultsList
                  results={results}
                  baseUrl={crawlResult.base_url}
                />
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-surface-1 p-8 text-center">
                <p className="text-body-sm text-muted-foreground">
                  No pages were crawled from this URL.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="page-enter-child" variant="default">
          <CardContent className="py-8">
            <CrawlEmptyState />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
