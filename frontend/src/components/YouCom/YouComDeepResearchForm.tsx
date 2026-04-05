import { zodResolver } from "@hookform/resolvers/zod"
import { BrainCircuit } from "lucide-react"
import { useForm } from "react-hook-form"

import type { YouComDeepResearchRequest } from "@/client/types.gen"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  researchEffortOptions,
  type YouComFormData,
  youComDeepResearchSchema,
  youComFormDefaults,
} from "@/lib/schemas/youcom"

interface YouComDeepResearchFormProps {
  onSubmit: (request: YouComDeepResearchRequest) => void
  isLoading: boolean
  disabled?: boolean
}

export function YouComDeepResearchForm({
  onSubmit: onSubmitProp,
  isLoading,
  disabled = false,
}: YouComDeepResearchFormProps) {
  const form = useForm<YouComFormData>({
    resolver: zodResolver(youComDeepResearchSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: youComFormDefaults,
  })

  const isFormDisabled = disabled || isLoading

  const onSubmit = (data: YouComFormData) => {
    onSubmitProp({
      query: data.query,
      research_effort: data.research_effort,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  placeholder="Compare the strongest open-source coding agents for enterprise use in 2026, including security, eval quality, and deployment constraints."
                  className="min-h-[120px] resize-y"
                  disabled={isFormDisabled}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                You.com runs a synchronous deep research pass and returns a
                markdown report with cited sources.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="research_effort"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Research Effort</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isFormDisabled}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select effort" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {researchEffortOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Higher effort increases depth and latency.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <LoadingButton
          type="submit"
          loading={isLoading}
          disabled={isFormDisabled}
        >
          <BrainCircuit className="mr-2 h-4 w-4" />
          Start Research
        </LoadingButton>
      </form>
    </Form>
  )
}

export default YouComDeepResearchForm
