import { createFileRoute } from "@tanstack/react-router"
import { Map as MapIcon } from "lucide-react"
import { useRef, useState } from "react"

import type { MapResponse } from "@/client/types.gen"
import { MapEmptyState } from "@/components/Tavily/MapEmptyState"
import { MapForm } from "@/components/Tavily/MapForm"
import { MapMetadata } from "@/components/Tavily/MapMetadata"
import { MapResultsList } from "@/components/Tavily/MapResultsList"
import { MapSkeleton } from "@/components/Tavily/MapSkeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMap } from "@/hooks/useMap"

export const Route = createFileRoute("/_layout/map")({
  component: MapPage,
  head: () => ({
    meta: [{ title: "Map - Tavily App" }],
  }),
})

function MapPage() {
  const [mapResult, setMapResult] = useState<MapResponse | null>(null)
  const startTimeRef = useRef<number>(0)

  const mutation = useMap({
    onSuccess: (data) => {
      setMapResult(data)
    },
  })

  const timedMutation = {
    ...mutation,
    mutate: (request: Parameters<typeof mutation.mutate>[0]) => {
      startTimeRef.current = Date.now()
      mutation.mutate(request)
    },
  } as typeof mutation

  const urls = mapResult?.urls || []
  const totalUrls = mapResult?.total_urls || urls.length

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <header className="page-enter space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <MapIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-display-lg font-medium tracking-tight">
              URL Mapping
            </h1>
          </div>
        </div>
        <p className="max-w-2xl text-body text-muted-foreground">
          Discover and map URLs from websites without extracting content.
          Perfect for site audits, link analysis, and content planning.
        </p>
      </header>

      {/* Form Card */}
      <Card className="page-enter-child" variant="elevated">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-heading">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Map Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MapForm mutation={timedMutation} />
        </CardContent>
      </Card>

      {/* Results Section */}
      {mutation.isPending ? (
        <Card className="page-enter-child" variant="default">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-heading">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              Mapping...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MapSkeleton />
          </CardContent>
        </Card>
      ) : mapResult ? (
        <Card className="page-enter-child" variant="elevated">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-heading">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Map Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <MapMetadata baseUrl={mapResult.base_url} totalUrls={totalUrls} />
            {urls.length > 0 ? (
              <>
                <div className="separator-elegant" />
                <MapResultsList urls={urls} baseUrl={mapResult.base_url} />
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-surface-1 p-8 text-center">
                <p className="text-body-sm text-muted-foreground">
                  No URLs were discovered from this website.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="page-enter-child" variant="default">
          <CardContent className="py-8">
            <MapEmptyState />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
