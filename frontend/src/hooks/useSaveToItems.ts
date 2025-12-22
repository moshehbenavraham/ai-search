import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { ItemsService } from "@/client"
import type { ItemCreate } from "@/client/types.gen"

export function useSaveToItems() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (item: ItemCreate) =>
      ItemsService.createItem({ requestBody: item }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
      toast.success("Saved to Items")
    },
    onError: () => {
      toast.error("Failed to save item")
    },
  })

  return mutation
}

export default useSaveToItems
