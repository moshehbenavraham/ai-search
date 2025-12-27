import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDown, Sparkles } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

import type { PerplexityDeepResearchRequest } from "@/client/types.gen"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { usePerplexityDeepResearch } from "@/hooks/usePerplexityDeepResearch"
import {
  modelOptions,
  type PerplexityFormData,
  parseDomainList,
  perplexityDeepResearchSchema,
  perplexityFormDefaults,
  reasoningEffortOptions,
  recencyFilterOptions,
  searchModeOptions,
} from "@/lib/schemas/perplexity"

interface PerplexityDeepResearchFormProps {
  onResearchComplete?: (data: unknown) => void
  onQuerySubmit?: (query: string) => void
  isLoading?: boolean
}

export function PerplexityDeepResearchForm({
  onResearchComplete,
  onQuerySubmit,
  isLoading: externalLoading,
}: PerplexityDeepResearchFormProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const form = useForm<PerplexityFormData>({
    resolver: zodResolver(perplexityDeepResearchSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: perplexityFormDefaults,
  })

  const mutation = usePerplexityDeepResearch({
    onSuccess: onResearchComplete,
  })

  const isLoading = externalLoading ?? mutation.isPending

  // Watch model to conditionally show reasoning_effort
  const selectedModel = form.watch("model")
  const showReasoningEffort = selectedModel === "sonar-reasoning"

  const onSubmit = (data: PerplexityFormData) => {
    // Notify parent of query submission
    onQuerySubmit?.(data.query)

    // Build request matching PerplexityDeepResearchRequest type
    const request: PerplexityDeepResearchRequest = {
      query: data.query,
      model: data.model,
      system_prompt: data.system_prompt || undefined,
      search_mode: data.search_mode,
      reasoning_effort: showReasoningEffort ? data.reasoning_effort : undefined,
      search_context_size: data.search_context_size,
      max_tokens: data.max_tokens,
      temperature: data.temperature,
      top_p: data.top_p,
      top_k: data.top_k,
      presence_penalty: data.presence_penalty,
      frequency_penalty: data.frequency_penalty,
      search_recency_filter: data.search_recency_filter,
      search_domain_filter: parseDomainList(data.search_domain_filter),
      search_after_date_filter: data.search_after_date_filter || undefined,
      search_before_date_filter: data.search_before_date_filter || undefined,
      return_images: data.return_images,
      return_related_questions: data.return_related_questions,
    }

    mutation.mutate(request)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe what you want to research. Be specific for better
                results.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Model and Search Mode Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Model Selection */}
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {modelOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Search Mode */}
          <FormField
            control={form.control}
            name="search_mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Search Mode</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select search mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {searchModeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Reasoning Effort - only for sonar-reasoning */}
          {showReasoningEffort && (
            <FormField
              control={form.control}
              name="reasoning_effort"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reasoning Effort</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select effort" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reasoningEffortOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Advanced Options Collapsible */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-muted/50"
            >
              <span>Advanced Options</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-6 pt-4">
            {/* Generation Parameters */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Generation Parameters
              </h4>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Max Tokens */}
                <FormField
                  control={form.control}
                  name="max_tokens"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Tokens</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={16384}
                          placeholder="16384"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? Number.parseInt(e.target.value, 10)
                                : undefined,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Temperature */}
                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperature</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={2}
                          step={0.1}
                          placeholder="0.7"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? Number.parseFloat(e.target.value)
                                : undefined,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Top P */}
                <FormField
                  control={form.control}
                  name="top_p"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Top P</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={1}
                          step={0.05}
                          placeholder="0.9"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? Number.parseFloat(e.target.value)
                                : undefined,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Top K */}
                <FormField
                  control={form.control}
                  name="top_k"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Top K</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? Number.parseInt(e.target.value, 10)
                                : undefined,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Domain and Date Filters */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Search Filters
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Domain Filter */}
                <FormField
                  control={form.control}
                  name="search_domain_filter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domain Filter</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example.com, docs.example.com"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of domains to search
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Recency Filter */}
                <FormField
                  control={form.control}
                  name="search_recency_filter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recency Filter</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Any time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {recencyFilterOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              Past {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* After Date */}
                <FormField
                  control={form.control}
                  name="search_after_date_filter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>After Date</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="MM/DD/YYYY"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Only include results after this date
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Before Date */}
                <FormField
                  control={form.control}
                  name="search_before_date_filter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Before Date</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="MM/DD/YYYY"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Only include results before this date
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Return Options */}
            <div className="flex flex-wrap gap-6">
              <FormField
                control={form.control}
                name="return_images"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Include Images
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="return_related_questions"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Include Related Questions
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Submit Button */}
        <LoadingButton type="submit" loading={isLoading} disabled={isLoading}>
          <Sparkles className="mr-2 h-4 w-4" />
          Start Research
        </LoadingButton>
      </form>
    </Form>
  )
}

export default PerplexityDeepResearchForm
