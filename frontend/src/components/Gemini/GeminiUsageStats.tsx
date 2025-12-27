import { BarChart3 } from "lucide-react"

import type { GeminiUsage } from "@/client/types.gen"
import { Badge } from "@/components/ui/badge"

interface GeminiUsageStatsProps {
  usage: GeminiUsage | null | undefined
}

export function GeminiUsageStats({ usage }: GeminiUsageStatsProps) {
  if (!usage) {
    return null
  }

  const { input_tokens = 0, output_tokens = 0, total_tokens = 0 } = usage

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <BarChart3 className="h-4 w-4" />
        <span>Token Usage:</span>
      </div>
      <Badge variant="secondary" className="font-mono text-xs">
        Input: {input_tokens.toLocaleString()}
      </Badge>
      <Badge variant="secondary" className="font-mono text-xs">
        Output: {output_tokens.toLocaleString()}
      </Badge>
      <Badge variant="outline" className="font-mono text-xs">
        Total: {total_tokens.toLocaleString()}
      </Badge>
    </div>
  )
}

export default GeminiUsageStats
