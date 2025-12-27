import { XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

interface GeminiCancelButtonProps {
  onCancel: () => void
  isLoading?: boolean
  disabled?: boolean
}

export function GeminiCancelButton({
  onCancel,
  isLoading = false,
  disabled = false,
}: GeminiCancelButtonProps) {
  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onCancel}
      disabled={disabled || isLoading}
    >
      <XCircle className="mr-2 h-4 w-4" />
      {isLoading ? "Cancelling..." : "Cancel Research"}
    </Button>
  )
}

export default GeminiCancelButton
