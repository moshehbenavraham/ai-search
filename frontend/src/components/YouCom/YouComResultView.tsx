import { Loader2, Save } from "lucide-react"
import Markdown from "react-markdown"

import type {
  YouComDeepResearchResponse,
  YouComResearchEffort,
} from "@/client/types.gen"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSaveToItems } from "@/hooks/useSaveToItems"
import { mapYouComResultToItem } from "@/lib/deep-research-mappers"

import { YouComSourcesList } from "./YouComSourcesList"

interface YouComResultViewProps {
  response: YouComDeepResearchResponse
  query: string
  researchEffort?: YouComResearchEffort
}

export function YouComResultView({
  response,
  query,
  researchEffort,
}: YouComResultViewProps) {
  const saveToItems = useSaveToItems()
  const content = response.output?.content ?? ""
  const contentType = response.output?.content_type ?? "text"
  const sources = response.output?.sources ?? []

  const handleSave = () => {
    const itemCreate = mapYouComResultToItem(response, query, researchEffort)
    saveToItems.mutate(itemCreate)
  }

  if (!content) {
    return (
      <Card variant="elevated">
        <CardContent className="py-8 text-center text-muted-foreground">
          No research content available.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Research Results
            </CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                Format: {contentType}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={saveToItems.isPending}
                aria-label="Save research to Items"
              >
                {saveToItems.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <Markdown
              components={{
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {children}
                  </a>
                ),
                code: ({ children, className }) => {
                  const isInline = !className
                  if (isInline) {
                    return (
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                        {children}
                      </code>
                    )
                  }
                  return (
                    <code className="block overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
                      {children}
                    </code>
                  )
                },
                pre: ({ children }) => (
                  <pre className="overflow-x-auto rounded-lg bg-muted p-4">
                    {children}
                  </pre>
                ),
              }}
            >
              {content}
            </Markdown>
          </div>
        </CardContent>
      </Card>

      <YouComSourcesList sources={sources} />
    </div>
  )
}

export default YouComResultView
