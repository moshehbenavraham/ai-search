import { z } from "zod"

// Zod schema for Gemini deep research form validation
export const geminiDeepResearchSchema = z.object({
  // Core fields - query is required
  query: z
    .string()
    .min(1, { message: "Research query is required" })
    .max(50000, { message: "Query must be 50,000 characters or less" }),

  // Options
  enable_thinking_summaries: z.boolean(),

  // File search store names - comma-separated string in form, converted to array
  file_search_store_names: z.string(),

  // Continuation - previous interaction ID for follow-up queries
  previous_interaction_id: z.string().optional(),
})

// Type for form data
export type GeminiFormData = z.infer<typeof geminiDeepResearchSchema>

// Helper to convert comma-separated string to array or null
export function parseStoreNamesList(value: string): string[] | null {
  if (!value.trim()) return null
  return value
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
}

// Default form values
export const geminiFormDefaults: GeminiFormData = {
  query: "",
  enable_thinking_summaries: false,
  file_search_store_names: "",
  previous_interaction_id: undefined,
}
