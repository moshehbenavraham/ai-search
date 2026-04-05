import { ExternalLink, Quote } from "lucide-react"

import type { YouComSource } from "@/client/types.gen"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface YouComSourcesListProps {
  sources?: YouComSource[] | null
}

export function YouComSourcesList({ sources }: YouComSourcesListProps) {
  if (!sources?.length) {
    return null
  }

  return (
    <Card variant="muted">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Sources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sources.map((source, index) => (
          <div
            key={`${source.url}-${index}`}
            className="rounded-lg border bg-background p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <p className="font-medium">
                  {source.title || `Source ${index + 1}`}
                </p>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-sm text-primary hover:underline"
                >
                  {source.url}
                </a>
              </div>
              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            </div>

            {source.snippets?.length ? (
              <div className="mt-3 space-y-2">
                {source.snippets.map((snippet, snippetIndex) => (
                  <div
                    key={`${source.url}-snippet-${snippetIndex}`}
                    className="flex gap-2 text-sm text-muted-foreground"
                  >
                    <Quote className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{snippet}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default YouComSourcesList
