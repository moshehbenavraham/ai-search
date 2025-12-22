interface MetadataDisplayProps {
  metadata: Record<string, unknown> | null | undefined
}

export function MetadataDisplay({ metadata }: MetadataDisplayProps) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No metadata available
      </p>
    )
  }

  const formattedJson = JSON.stringify(metadata, null, 2)

  return (
    <div className="rounded-md border bg-muted/50 p-3 overflow-auto max-h-[300px]">
      <pre className="text-sm font-mono whitespace-pre">{formattedJson}</pre>
    </div>
  )
}
