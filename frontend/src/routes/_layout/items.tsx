import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense } from "react"
import { z } from "zod"

import { ItemsService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import AddItem from "@/components/Items/AddItem"
import {
  ContentTypeFilter,
  type ContentTypeFilterValue,
} from "@/components/Items/ContentTypeFilter"
import { columns } from "@/components/Items/columns"
import PendingItems from "@/components/Pending/PendingItems"

const itemsSearchSchema = z.object({
  type: z
    .enum(["all", "search", "extract", "crawl", "map", "perplexity", "gemini"])
    .optional()
    .default("all"),
})

function getItemsQueryOptions(contentType: ContentTypeFilterValue) {
  const apiContentType = contentType === "all" ? undefined : contentType
  return {
    queryFn: () =>
      ItemsService.readItems({
        skip: 0,
        limit: 100,
        contentType: apiContentType,
      }),
    queryKey: ["items", { contentType }],
  }
}

export const Route = createFileRoute("/_layout/items")({
  component: Items,
  validateSearch: itemsSearchSchema,
  head: () => ({
    meta: [
      {
        title: "Items - AIwithApex.com",
      },
    ],
  }),
})

function ItemsTableContent({
  contentType,
}: {
  contentType: ContentTypeFilterValue
}) {
  const { data: items } = useSuspenseQuery(getItemsQueryOptions(contentType))

  if (items.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">
          {contentType === "all"
            ? "You don't have any items yet"
            : `No ${contentType} items found`}
        </h3>
        <p className="text-muted-foreground">
          {contentType === "all"
            ? "Add a new item to get started"
            : "Try a different filter or add new items"}
        </p>
      </div>
    )
  }

  return <DataTable columns={columns} data={items.data} />
}

function ItemsTable({ contentType }: { contentType: ContentTypeFilterValue }) {
  return (
    <Suspense fallback={<PendingItems />}>
      <ItemsTableContent contentType={contentType} />
    </Suspense>
  )
}

function Items() {
  const { type: contentType } = Route.useSearch()
  const navigate = useNavigate()

  const handleFilterChange = (value: ContentTypeFilterValue) => {
    navigate({
      to: "/items",
      search: { type: value === "all" ? undefined : value },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Items</h1>
          <p className="text-muted-foreground">Create and manage your items</p>
        </div>
        <div className="flex items-center gap-3">
          <ContentTypeFilter
            value={contentType}
            onChange={handleFilterChange}
          />
          <AddItem />
        </div>
      </div>
      <ItemsTable contentType={contentType} />
    </div>
  )
}
