import { zodResolver } from "@hookform/resolvers/zod"
import { Sparkles } from "lucide-react"
import { useForm } from "react-hook-form"

import type { GeminiDeepResearchRequest } from "@/client/types.gen"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LoadingButton } from "@/components/ui/loading-button"
import { Textarea } from "@/components/ui/textarea"
import {
  type GeminiFormData,
  geminiDeepResearchSchema,
  geminiFormDefaults,
  parseStoreNamesList,
} from "@/lib/schemas/gemini"

interface GeminiDeepResearchFormProps {
  onSubmit: (data: GeminiDeepResearchRequest) => void
  isLoading?: boolean
  disabled?: boolean
}

export function GeminiDeepResearchForm({
  onSubmit,
  isLoading = false,
  disabled = false,
}: GeminiDeepResearchFormProps) {
  const form = useForm<GeminiFormData>({
    resolver: zodResolver(geminiDeepResearchSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: geminiFormDefaults,
  })

  const handleSubmit = (data: GeminiFormData) => {
    // Build request matching GeminiDeepResearchRequest type
    const request: GeminiDeepResearchRequest = {
      query: data.query,
      enable_thinking_summaries: data.enable_thinking_summaries,
      file_search_store_names:
        parseStoreNamesList(data.file_search_store_names) ?? undefined,
      previous_interaction_id: data.previous_interaction_id || undefined,
    }

    onSubmit(request)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Query Input */}
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Research Query <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your research query..."
                  className="min-h-[100px] resize-y"
                  disabled={disabled || isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe what you want to research. Gemini deep research can
                take up to 60 minutes for comprehensive queries.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Options Row */}
        <div className="flex flex-wrap gap-6">
          {/* Enable Thinking Summaries */}
          <FormField
            control={form.control}
            name="enable_thinking_summaries"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled || isLoading}
                  />
                </FormControl>
                <div>
                  <FormLabel className="font-normal">
                    Enable Thinking Summaries
                  </FormLabel>
                  <FormDescription className="text-xs">
                    Include reasoning summaries in the response
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <LoadingButton
          type="submit"
          loading={isLoading}
          disabled={disabled || isLoading}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Start Research
        </LoadingButton>
      </form>
    </Form>
  )
}

export default GeminiDeepResearchForm
