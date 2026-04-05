import { z } from "zod"

export const researchEffortOptions = [
  "lite",
  "standard",
  "deep",
  "exhaustive",
] as const

export const youComDeepResearchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, { message: "Research query is required" })
    .max(10000, { message: "Query must be 10,000 characters or less" }),
  research_effort: z.enum(researchEffortOptions),
})

export type YouComFormData = z.infer<typeof youComDeepResearchSchema>

export const youComFormDefaults: YouComFormData = {
  query: "",
  research_effort: "standard",
}
