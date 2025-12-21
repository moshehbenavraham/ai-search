import { zodResolver } from "@hookform/resolvers/zod"
import type { UseMutationResult } from "@tanstack/react-query"
import { Search } from "lucide-react"
import { useForm } from "react-hook-form"

import type { SearchRequest, SearchResponse } from "@/client/types.gen"
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
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTavilySearch } from "@/hooks/useTavilySearch"
import {
  parseDomainList,
  type SearchFormData,
  searchDepthOptions,
  searchFormDefaults,
  searchTopicOptions,
  tavilySearchSchema,
} from "@/lib/schemas/tavily"

type SearchMutation = UseMutationResult<SearchResponse, Error, SearchRequest>

interface SearchFormProps {
  onSearchComplete?: (data: SearchResponse) => void
  mutation?: SearchMutation
}

export function SearchForm({
  onSearchComplete,
  mutation: externalMutation,
}: SearchFormProps) {
  const form = useForm<SearchFormData>({
    resolver: zodResolver(tavilySearchSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: searchFormDefaults,
  })

  const internalMutation = useTavilySearch({
    onSuccess: onSearchComplete,
  })

  const mutation = externalMutation ?? internalMutation

  const onSubmit = (data: SearchFormData) => {
    // Build request matching SearchRequest type
    const request: SearchRequest = {
      query: data.query,
      search_depth: data.search_depth,
      topic: data.topic,
      max_results: data.max_results,
      include_answer: data.include_answer,
      include_images: data.include_images,
      include_domains: parseDomainList(data.include_domains),
      exclude_domains: parseDomainList(data.exclude_domains),
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
                Search Query <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your search query..."
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Search Options Row */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Search Depth */}
          <FormField
            control={form.control}
            name="search_depth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Search Depth</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select depth" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {searchDepthOptions.map((option) => (
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

          {/* Topic */}
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Topic</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {searchTopicOptions.map((option) => (
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

          {/* Max Results */}
          <FormField
            control={form.control}
            name="max_results"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Results</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Domain Filters */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="include_domains"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Include Domains</FormLabel>
                <FormControl>
                  <Input
                    placeholder="example.com, docs.example.com"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Comma-separated list of domains
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="exclude_domains"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exclude Domains</FormLabel>
                <FormControl>
                  <Input
                    placeholder="pinterest.com, facebook.com"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Comma-separated list of domains
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Checkboxes */}
        <div className="flex flex-wrap gap-6">
          <FormField
            control={form.control}
            name="include_answer"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">Include AI Answer</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="include_images"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">Include Images</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <LoadingButton type="submit" loading={mutation.isPending}>
          <Search className="mr-2 h-4 w-4" />
          Search
        </LoadingButton>
      </form>
    </Form>
  )
}

export default SearchForm
