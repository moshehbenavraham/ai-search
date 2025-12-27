import { useMutation, useQuery } from "@tanstack/react-query"

import { GeminiService } from "@/client"
import type {
  GeminiDeepResearchJobResponse,
  GeminiDeepResearchRequest,
  GeminiDeepResearchResultResponse,
  GeminiInteractionStatus,
} from "@/client/types.gen"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

// Terminal statuses that indicate polling should stop
const TERMINAL_STATUSES: GeminiInteractionStatus[] = [
  "completed",
  "failed",
  "cancelled",
]

// Helper to check if status is terminal
export function isTerminalStatus(status: GeminiInteractionStatus): boolean {
  return TERMINAL_STATUSES.includes(status)
}

// Default polling interval in milliseconds (5 seconds)
const DEFAULT_POLL_INTERVAL = 5000

// ============================================================================
// useGeminiStartResearch - Mutation to start a new deep research job
// ============================================================================

interface UseGeminiStartResearchOptions {
  onSuccess?: (data: GeminiDeepResearchJobResponse) => void
  onError?: (error: Error) => void
}

export function useGeminiStartResearch(
  options?: UseGeminiStartResearchOptions,
) {
  const { showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: (data: GeminiDeepResearchRequest) =>
      GeminiService.startDeepResearch({ requestBody: data }),
    onSuccess: (data) => {
      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      handleError.call(showErrorToast, error as any)
      options?.onError?.(error)
    },
  })

  return mutation
}

// ============================================================================
// useGeminiPollResearch - Query with refetchInterval for polling job status
// ============================================================================

interface UseGeminiPollResearchOptions {
  interactionId: string | null
  lastEventId?: string | null
  pollInterval?: number
  enabled?: boolean
  onSuccess?: (data: GeminiDeepResearchResultResponse) => void
}

export function useGeminiPollResearch(options: UseGeminiPollResearchOptions) {
  const { showErrorToast } = useCustomToast()
  const {
    interactionId,
    lastEventId,
    pollInterval = DEFAULT_POLL_INTERVAL,
    enabled = true,
    onSuccess,
  } = options

  const query = useQuery({
    queryKey: ["gemini-poll", interactionId, lastEventId],
    queryFn: async () => {
      if (!interactionId) {
        throw new Error("Interaction ID is required for polling")
      }
      const result = await GeminiService.pollDeepResearch({
        interactionId,
        lastEventId: lastEventId ?? undefined,
      })
      // Call onSuccess callback if provided
      onSuccess?.(result)
      return result
    },
    enabled: enabled && !!interactionId,
    refetchInterval: (query) => {
      // Stop polling if we have data and it's in a terminal status
      const data = query.state.data
      if (data && isTerminalStatus(data.status)) {
        return false
      }
      return pollInterval
    },
    refetchIntervalInBackground: false,
    retry: 3,
    staleTime: 0, // Always refetch on mount
  })

  // Handle errors via toast
  if (query.error) {
    handleError.call(showErrorToast, query.error as any)
  }

  return query
}

// ============================================================================
// useGeminiCancelResearch - Mutation to cancel a running research job
// ============================================================================

interface UseGeminiCancelResearchOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useGeminiCancelResearch(
  options?: UseGeminiCancelResearchOptions,
) {
  const { showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: (interactionId: string) =>
      GeminiService.cancelDeepResearch({ interactionId }),
    onSuccess: () => {
      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      handleError.call(showErrorToast, error as any)
      options?.onError?.(error)
    },
  })

  return mutation
}

// ============================================================================
// useGeminiSyncResearch - Mutation for blocking synchronous workflow
// ============================================================================

interface UseGeminiSyncResearchOptions {
  onSuccess?: (data: GeminiDeepResearchResultResponse) => void
  onError?: (error: Error) => void
}

export function useGeminiSyncResearch(options?: UseGeminiSyncResearchOptions) {
  const { showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: (data: GeminiDeepResearchRequest) =>
      GeminiService.deepResearchSync({ requestBody: data }),
    onSuccess: (data) => {
      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      handleError.call(showErrorToast, error as any)
      options?.onError?.(error)
    },
  })

  return mutation
}
