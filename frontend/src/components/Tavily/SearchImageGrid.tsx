import { ExternalLink, ImageIcon } from "lucide-react"

import type { SearchImage } from "@/client/types.gen"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SearchImageGridProps {
  images: SearchImage[]
}

export function SearchImageGrid({ images }: SearchImageGridProps) {
  if (!images || images.length === 0) {
    return null
  }

  const handleImageClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ImageIcon className="h-4 w-4" />
          Images ({images.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((image, index) => (
            <button
              type="button"
              key={`${image.url}-${index}`}
              onClick={() => handleImageClick(image.url)}
              className="group relative aspect-square overflow-hidden rounded-md border bg-muted transition-all hover:ring-2 hover:ring-primary hover:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={image.description || `Open image ${index + 1}`}
            >
              <img
                src={image.url}
                alt={image.description || `Search result image ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                  target.parentElement?.classList.add("bg-muted")
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <ExternalLink className="h-5 w-5 text-white" />
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default SearchImageGrid
