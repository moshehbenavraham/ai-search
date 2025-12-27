import type {
  GeminiDeepResearchResultResponse,
  ItemCreate,
  PerplexityDeepResearchResponse,
} from "@/client/types.gen"

/**
 * Sanitize string to remove invalid Unicode surrogate characters
 * These can cause encoding errors when sent to the backend
 */
function sanitizeString(str: string): string {
  return str.replace(/[\uD800-\uDFFF]/g, "")
}

/**
 * Maps a Perplexity deep research response to ItemCreate format.
 * Extracts the main content from choices[0].message.content and stores
 * citations, search_results, and usage in item_metadata.
 */
export function mapPerplexityResultToItem(
  response: PerplexityDeepResearchResponse,
  query: string,
): ItemCreate {
  const content =
    response.choices?.[0]?.message?.content || "No content available"
  const sanitizedContent = sanitizeString(content)

  return {
    title: `Perplexity: ${sanitizeString(query).slice(0, 200)}`.slice(0, 255),
    description: sanitizedContent.slice(0, 255),
    source_url: null,
    content: sanitizedContent,
    content_type: "perplexity",
    item_metadata: {
      query,
      model: response.model,
      response_id: response.id,
      citations: response.citations || [],
      search_results: response.search_results || [],
      related_questions: response.related_questions || [],
      images: response.images || [],
      usage: response.usage || null,
      created: response.created,
    },
  }
}

/**
 * Maps a Gemini deep research response to ItemCreate format.
 * Combines all output segments into content and stores thinking_summary,
 * usage, and grounding_metadata in item_metadata.
 */
export function mapGeminiResultToItem(
  response: GeminiDeepResearchResultResponse,
  query: string,
  interactionId: string,
): ItemCreate {
  // Combine all output content segments
  const outputs = response.outputs || []
  const combinedContent = outputs
    .filter((output) => output.content)
    .map((output) => sanitizeString(output.content || ""))
    .join("\n\n")

  // Extract thinking summaries if available
  const thinkingSummaries = outputs
    .filter((output) => output.thinking_summary)
    .map((output) => sanitizeString(output.thinking_summary || ""))

  const content = combinedContent || "No content available"

  return {
    title: `Gemini: ${sanitizeString(query).slice(0, 200)}`.slice(0, 255),
    description: content.slice(0, 255),
    source_url: null,
    content: content,
    content_type: "gemini",
    item_metadata: {
      query,
      interaction_id: interactionId,
      status: response.status,
      thinking_summaries: thinkingSummaries,
      outputs_count: outputs.length,
      usage: response.usage || null,
      completed_at: response.completed_at || null,
      event_type: response.event_type || null,
    },
  }
}
