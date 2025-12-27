import { ChevronDown, Lightbulb } from "lucide-react"
import { useState } from "react"
import Markdown from "react-markdown"

import type {
  GeminiDeepResearchResultResponse,
  GeminiOutput,
} from "@/client/types.gen"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"

import { GeminiUsageStats } from "./GeminiUsageStats"

interface GeminiResultViewProps {
  response: GeminiDeepResearchResultResponse
}

// Extract main content from outputs
function extractContent(outputs: GeminiOutput[] | undefined): string {
  if (!outputs || outputs.length === 0) {
    return ""
  }

  return outputs
    .filter((output) => output.content)
    .map((output) => output.content)
    .join("\n\n")
}

// Extract thinking summaries from outputs
function extractThinkingSummaries(
  outputs: GeminiOutput[] | undefined,
): string[] {
  if (!outputs || outputs.length === 0) {
    return []
  }

  return outputs
    .filter((output) => output.thinking_summary)
    .map((output) => output.thinking_summary as string)
}

export function GeminiResultView({ response }: GeminiResultViewProps) {
  const [thinkingOpen, setThinkingOpen] = useState(false)

  const content = extractContent(response.outputs)
  const thinkingSummaries = extractThinkingSummaries(response.outputs)
  const usage = response.usage

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
            <span className="text-xs text-muted-foreground">
              Status: {response.status}
            </span>
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

      {/* Thinking Summaries */}
      {thinkingSummaries.length > 0 && (
        <Collapsible open={thinkingOpen} onOpenChange={setThinkingOpen}>
          <Card variant="muted">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between p-4 text-sm font-medium transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <span>Thinking Summaries ({thinkingSummaries.length})</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${thinkingOpen ? "rotate-180" : ""}`}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {thinkingSummaries.map((summary, index) => (
                    <div
                      key={index}
                      className="rounded-lg border bg-background p-4"
                    >
                      <p className="text-sm text-muted-foreground">{summary}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Token Usage */}
      {usage && (
        <>
          <Separator />
          <GeminiUsageStats usage={usage} />
        </>
      )}
    </div>
  )
}

export default GeminiResultView
