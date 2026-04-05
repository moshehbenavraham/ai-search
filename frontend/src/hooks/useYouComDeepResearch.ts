import { useMutation } from "@tanstack/react-query"

import { YouComService } from "@/client"
import type {
  YouComDeepResearchRequest,
  YouComDeepResearchResponse,
} from "@/client/types.gen"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

interface UseYouComDeepResearchOptions {
  onSuccess?: (data: YouComDeepResearchResponse) => void
}

export function useYouComDeepResearch(options?: UseYouComDeepResearchOptions) {
  const { showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: (data: YouComDeepResearchRequest) =>
      YouComService.deepResearch({ requestBody: data }),
    onSuccess: (data) => {
      options?.onSuccess?.(data)
    },
    onError: handleError.bind(showErrorToast),
  })

  return mutation
}

export default useYouComDeepResearch
