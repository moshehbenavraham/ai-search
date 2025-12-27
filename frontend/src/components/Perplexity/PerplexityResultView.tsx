import { Loader2, Save } from "lucide-react"
import Markdown from "react-markdown"

import type { PerplexityDeepResearchResponse } from "@/client/types.gen"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useSaveToItems } from "@/hooks/useSaveToItems"
import { mapPerplexityResultToItem } from "@/lib/deep-research-mappers"

import { PerplexityCitationsList } from "./PerplexityCitationsList"
import { PerplexityUsageStats } from "./PerplexityUsageStats"

interface PerplexityResultViewProps {
  response: PerplexityDeepResearchResponse
  query: string
}

export function PerplexityResultView({
  response,
  query,
}: PerplexityResultViewProps) {
  const saveToItems = useSaveToItems()

  // Extract content from the first choice
  const content = response.choices?.[0]?.message?.content ?? ""
  const model = response.model
  const citations = response.citations
  const searchResults = response.search_results
  const usage = response.usage

  const handleSave = () => {
    const itemCreate = mapPerplexityResultToItem(response, query)
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
      {/* Research Content */}
      <Card variant="elevated">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Research Results
            </CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                Model: {model}
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
                // Style links to be clickable
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
                // Style code blocks
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
                // Style pre blocks
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

      {/* Token Usage */}
      {usage && (
        <>
          <Separator />
          <PerplexityUsageStats usage={usage} />
        </>
      )}

      {/* Citations */}
      {(citations?.length || searchResults?.length) && (
        <PerplexityCitationsList
          citations={citations}
          searchResults={searchResults}
        />
      )}
    </div>
  )
}

export default PerplexityResultView
