import type {
  CrawlResult,
  ExtractResult,
  ItemCreate,
  SearchResult,
} from "@/client/types.gen"

/**
 * Extract domain from URL safely
 */
function extractDomain(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/^www\./, "")
  } catch {
    return url.slice(0, 50)
  }
}

/**
 * Extract path from URL safely
 */
function extractPath(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.pathname || "/"
  } catch {
    return url.slice(0, 50)
  }
}

/**
 * Maps a Tavily search result to ItemCreate format.
 * Stores the search result content and metadata including score and query.
 */
export function mapSearchResultToItem(
  result: SearchResult,
  query: string,
): ItemCreate {
  return {
    title: result.title,
    description: result.content.slice(0, 500),
    source_url: result.url,
    content: result.raw_content || result.content,
    content_type: "search",
    item_metadata: {
      score: result.score,
      query,
      domain: extractDomain(result.url),
    },
  }
}

/**
 * Maps a Tavily extract result to ItemCreate format.
 * Stores the extracted raw content and metadata including domain and images.
 */
export function mapExtractResultToItem(result: ExtractResult): ItemCreate {
  const domain = extractDomain(result.url)

  return {
    title: `Extracted: ${domain}`,
    description: result.raw_content.slice(0, 500),
    source_url: result.url,
    content: result.raw_content,
    content_type: "extract",
    item_metadata: {
      domain,
      images: result.images || [],
      char_count: result.raw_content.length,
    },
  }
}

/**
 * Maps a Tavily crawl result to ItemCreate format.
 * Stores the crawled page content with metadata including base URL and index.
 */
export function mapCrawlResultToItem(
  result: CrawlResult,
  baseUrl: string,
  index: number,
): ItemCreate {
  const path = extractPath(result.url)
  const content = result.raw_content || ""

  return {
    title: `Crawled: ${path}`,
    description: content.slice(0, 500) || "No content extracted",
    source_url: result.url,
    content: content,
    content_type: "crawl",
    item_metadata: {
      base_url: baseUrl,
      path,
      index,
      char_count: content.length,
    },
  }
}

/**
 * Maps Tavily map results (URL list) to ItemCreate format.
 * Stores all discovered URLs as JSON content with metadata.
 */
export function mapMapResultsToItem(
  urls: string[],
  baseUrl: string,
): ItemCreate {
  const domain = extractDomain(baseUrl)

  return {
    title: `Site Map: ${domain}`,
    description: `${urls.length} URLs discovered from ${domain}`,
    source_url: baseUrl,
    content: JSON.stringify(urls, null, 2),
    content_type: "map",
    item_metadata: {
      domain,
      base_url: baseUrl,
      url_count: urls.length,
    },
  }
}
