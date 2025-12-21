import { FileText, Hash, MessageSquare } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SearchMetadataProps {
  query: string
  resultCount: number
  answer?: string | null
}

export function SearchMetadata({
  query,
  resultCount,
  answer,
}: SearchMetadataProps) {
  return (
    <div className="space-y-4">
      {/* Query info */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="secondary" className="gap-1.5">
          <FileText className="h-3 w-3" />
          Query: {query}
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <Hash className="h-3 w-3" />
          {resultCount} {resultCount === 1 ? "result" : "results"}
        </Badge>
      </div>

      {/* AI Answer */}
      {answer && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="h-4 w-4 text-primary" />
              AI Answer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{answer}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SearchMetadata
