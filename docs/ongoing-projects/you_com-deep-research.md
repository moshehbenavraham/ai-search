***

title: Research API Overview
'og:title': You.com Research API | Multi-Step Reasoning with Citations
'og:description': >-
Get thorough, well-cited answers to complex questions. The Research API runs
multiple searches, reads through sources, and synthesizes everything into a
Markdown response with inline citations.
----------------------------------------

## Skills (Agent Skills)

https://github.com/youdotcom-oss/agent-skills

## What is the Research API?

The Research API returns grounded, natural language answers to questions of varying complexity.
It runs multiple searches, processes the results, cross-references sources, and synthesizes everything into a thorough, Markdown-formatted answer with inline citations.

Ask a hard question, get a researched answer with sources.

***

## How it's different from Search

The Search API and the Research API serve different purposes by delivering different outputs:

|                | Search API                                                         | Research API                                                         |
| -------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------- |
| **Input**      | Query, several search parameters (count, language, livecrawl etc.) | Query, research effort                                               |
| **You get**    | Raw search results (URLs, snippets, metadata)                      | A natural language answer with inline citations, plus search results |
| **Processing** | Returns results as-is for you to process                           | Reads, reasons over, and synthesizes results for you                 |
| **Speed**      | Fast — single search round trip                                    | Varies — multiple searches and reasoning steps                       |
| **Control**    | Full control over how results are used                             | Control depth via `research_effort`                                  |
| **Best for**   | RAG pipelines, building your own search UI, data gathering         | Answering questions of varying complexity using multiple sources     |

Use the Search API when you want raw results to feed into your own pipeline. Use the Research API when you want a ready-to-use answer backed by sources.

***

## How it works

Research operates as an agentic system that autonomously plans and executes a multi-step research strategy for your question.

### Search, Contents, and Live News as retrieval primitives

Research uses You.com's Search, Contents, and Live News APIs as its core tools.
Rather than firing generic web queries, the system selects the right tool for each sub-question — search for discovery, contents for deep page reads, live news for time-sensitive information, and several other internal tools to aid in generating the best possible answer.
This targeted tool selection reduces wasted calls and gives the reasoning model cleaner inputs at each step.

The system also evaluates retrieved sources for freshness, diversity, and relevance before incorporating them into the answer.

### Context management at scale

Deep research generates far more information than any single LLM context window can hold. Research uses context-masking and compaction strategies that let it operate well beyond those limits — maintaining coherent reasoning across hundreds or thousands of turns without losing track of what it found, what it verified, and what remains unresolved.

At higher effort levels, a single query can run more than 1,000 reasoning turns and process up to 10 million tokens.

### Budget-based planning

The system receives a compute budget determined by the `research_effort` tier you choose. It plans its approach around that budget, allocating more effort to verifying ambiguous or high-stakes claims and moving quickly through well-sourced facts. This is the mechanism that enables the range of latency, accuracy, and cost tradeoffs across tiers.

***

## What you get

Every Research API response includes:

* **`content`**: A Markdown-formatted answer with numbered inline citations (e.g., `[[1, 2]]`) that reference items in the `sources` array.
* **`content_type`**: The format of the content field (currently `text`).
* **`sources`**: The web pages the API read and cited in the answer — each with a URL, title, and relevant snippets.

```json maxLines=25
{
  "output": {
    "content": "## RISC-V vs ARM: Key Architectural Differences\n\nRISC-V and ARM are both reduced instruction set architectures, but they differ in licensing, extensibility, and ecosystem maturity [[1, 2]].\n\n### Licensing\nARM requires per-chip licensing fees, while RISC-V is open-source and royalty-free [[1, 3]]...",
    "content_type": "text",
    "sources": [
      {
        "url": "https://example.com/risc-v-vs-arm",
        "title": "RISC-V vs ARM: A Technical Comparison",
        "snippets": [
          "RISC-V's open ISA allows custom extensions without licensing negotiations, making it attractive for specialized hardware."
        ]
      },
      {
        "url": "https://example.com/processor-architectures",
        "title": "Modern Processor Architectures Explained",
        "snippets": [
          "ARM's mature ecosystem includes extensive tooling and vendor support built over three decades."
        ]
      }
    ]
  }
}
```

***

## Key features

### Research effort levels

The `research_effort` parameter controls how much compute the API allocates to your question. Higher effort means more searches, deeper source reading, and more cross-referencing — at the cost of longer response times.

| Level        | Behavior                                | Typical latency | Price per 1,000 requests |
| ------------ | --------------------------------------- | --------------- | ------------------------ |
| `lite`       | Quick answer with minimal searching     | \< 2s           | \$10                     |
| `standard`   | Balanced speed and depth (default)      | \~10–30s        | \$50                     |
| `deep`       | More searches, deeper cross-referencing | \< 120s         | \$100                    |
| `exhaustive` | Maximum thoroughness                    | \< 300s         | \$300                    |

For the same query, the difference between tiers is substantial. Here's an abridged comparison for the question *"Which global cities improved air quality the most over the past 10 years, and what measurable actions contributed?"*:

<Tabs>
  <Tab title="research_effort = standard">
    ```json maxLines=40 wordWrap
    {
      "output": {
        "content": "Global assessments show that the largest recent urban air-quality improvements are concentrated in East China, parts of the eastern United States, Europe, and Japan, with especially strong gains in Chinese megacities and cities with aggressive traffic-emissions controls such as London [[1, 2, 3]].\n\n1) Beijing (China) — PM2.5 fell from ~89–90 µg/m³ in 2013 to ~58 µg/m³ in 2017 (about 35–36% in five years), with evidence from both satellite and surface observations [[4, 5]].\nKey drivers included coal phase-down, industrial controls, stricter vehicle/fuel standards, and regional enforcement [[6, 7, 8]].\n\n2) Chinese city clusters (BTH / YRD / PRD) — China's population-weighted PM2.5 fell ~32% from 2013–2017, with the largest modeled decline in Beijing–Tianjin–Hebei (~38%); across 367 cities, observed PM2.5 fell ~44% from 2013–2019 [[9, 10]].\nThe main drivers were national clean-air action plans, coal controls, industrial restructuring, and transport emissions standards [[7, 9, 10]].\n\n3) London (UK) — London achieved major NO2 reductions linked to LEZ/ULEZ policies, with monitoring and modeling studies showing accelerated declines after ULEZ implementation and meaningful reductions versus no-ULEZ scenarios [[11, 12, 13, 14]].",
        "content_type": "text",
        "sources": [
          {
            "url": "https://pubmed.ncbi.nlm.nih.gov/36356738/",
            "title": "Trends in urban air pollution over the last two decades: A global perspective - PubMed",
            "snippets": [
              "At global scale, PM2.5 exposures declined slightly from 2000 to 2019 ... Improvements were observed in the Eastern US, Europe, Southeast China, and Japan..."
            ]
          }
        ]
      }
    }
    ```
  </Tab>

  <Tab title="research_effort = exhaustive">
    ```json maxLines=40 wordWrap
    {
      "output": {
        "content": "There is no single definitive \"top 10\" ranking, but several independent datasets and case studies point to a small group of cities — especially in China plus a few in Europe and North America — that have seen the largest, clearly measured air-quality gains in roughly the last decade. Below are the clearest examples where both (1) large, quantified reductions in PM2.5 or NO2 are documented and (2) specific policies can be tied to those improvements.\n\n1) Beijing (and other major Chinese cities)\nBeijing shows one of the strongest documented improvements globally. Annual mean PM2.5 fell from roughly 89–102 µg/m³ in 2013 to about 32–39 µg/m³ by 2023, implying an approximately 60–65% reduction over about a decade [[1, 2, 3, 4]]. National analyses also show large PM2.5 declines across hundreds of Chinese cities, and EPIC/AQLI attributes a major share of global PM2.5 reduction since 2013 to China's air-quality policies [[5, 6, 7]].\nThe key drivers were policy-led and multi-sector: coal-to-clean energy transition, coal boiler controls, industrial restructuring, tighter emissions standards, vehicle standards and scrappage, fuel quality improvements, and regional coordination across Beijing–Tianjin–Hebei [[8, 9, 10, 11, 12, 13]]. Atmospheric modeling indicates most of Beijing's 2013–2017 PM2.5 improvement was due to emissions reductions rather than weather variation [[2, 8]].\n\n2) Seoul metropolitan area (Seoul, Incheon, Gyeonggi)\nThe Seoul metropolitan region shows strong evidence of long-term emissions reductions tied to policy. Joint Seoul/UNEP assessments report very large reductions in fine particulate emissions (including about a 75% reduction in Seoul's emitted PM2.5 mass and substantial reductions in Gyeonggi) over 2005–2020 [[14]]. Additional studies indicate stricter vehicle-emissions regulations contributed to lower particulate concentrations in the 2010s compared with the 2000s [[15]], while UNEP reports national PM2.5 emissions declines with even greater reductions in Seoul and Gyeonggi [[16]].\nKey actions included tightening vehicle standards, replacing diesel buses with CNG buses, incentivizing after-treatment systems and cleaner vehicles, emissions-cap regulation and trading in the Seoul metropolitan area, fuel switching, and stronger industrial controls [[15, 17, 18, 19]]. Seoul still experiences episodic pollution due in part to transboundary transport, especially from upwind regions [[20, 21, 22]].\n\n3) London (ULEZ, LEZ, congestion charging)...",
        "content_type": "text",
        "sources": [
          {
            "url": "https://sustainablemobility.iclei.org/air-pollution-beijing/",
            "title": "Clearing the skies: how Beijing tackled air pollution & what lies ahead - ICLEI Sustainable Mobility",
            "snippets": [
              "China played a vital role, accounting for three-quarters of global air pollution reductions from 2013-2020...",
              "The annual average PM2.5 concentrations ... decreased..."
            ]
          }
        ]
      }
    }
    ```
  </Tab>
</Tabs>

The `exhaustive` response identifies additional cities (Seoul, with specific UNEP data), includes more granular measurements (µg/m³ ranges, percentage reductions over specific date ranges), and cross-references more sources to verify claims.

### Citation-backed answers

Every claim in the response links back to a specific source via inline citations. Your users (or your system) can verify any statement by following the numbered references to the `sources` array.

### Markdown output

The `content` field is formatted in Markdown with headers, lists, and inline citations — ready to render in a UI or feed into downstream processing.

***

## Quickstart

<CodeBlock>
  ```python maxLines=0
  from youdotcom import You
  from youdotcom.models import ResearchEffort

  you = You(api_key_auth="api_key")

  res = you.research(
      input="Top 5 EV-selling companies worldwide in 2025 so far",
      research_effort=ResearchEffort.STANDARD,
  )

  print(res.output.content)

  print(f"\n--- {len(res.output.sources)} sources ---")
  for i, source in enumerate(res.output.sources, 1):
      print(f"[{i}] {source.title or 'Untitled'}: {source.url}")
  ```

  ```typescript
  import { You } from "@youdotcom-oss/sdk";
  import type { ResearchRequest } from "@youdotcom-oss/sdk/models/operations";
  import { ResearchEffort } from "@youdotcom-oss/sdk/models/operations";

  const you = new You({ apiKeyAuth: "api_key" });

  const request: ResearchRequest = {
    input: "Top 5 EV-selling companies worldwide in 2025 so far",
    researchEffort: ResearchEffort.Standard,
  };

  const result = await you.research(request);

  console.log(result.output.content);

  console.log(`\n--- ${result.output.sources.length} sources ---`);
  result.output.sources.forEach((s, i) => {
    console.log(`[${i + 1}] ${s.title ?? s.url}: ${s.url}`);
  });
  ```

  ```curl
  curl -X POST https://api.you.com/v1/research \
    -H "X-API-Key: api_key" \
    -H "Content-Type: application/json" \
    -d '{
      "input": "Top 5 EV-selling companies worldwide in 2025 so far",
      "research_effort": "standard"
    }'
  ```
</CodeBlock>

<Card title="Try in Postman" icon="fa-regular fa-rocket" href="https://www.postman.com/youdotcom/you-com-api-workspace/collection/46015159-b2f6290f-99e7-46e0-9a73-1e5fcd0e81a3">
  Fork the Research API collection, add your API key to the `production` environment, and hit Send.
</Card>

***

## Parameters

| Parameter         | Type   | Required | Description                                                           |
| ----------------- | ------ | -------- | --------------------------------------------------------------------- |
| `input`           | string | Yes      | The research question (max 40,000 characters)                         |
| `research_effort` | string | No       | Depth of research: `lite`, `standard` (default), `deep`, `exhaustive` |

[View full API reference](/api-reference/research/v1-research)

***

## Common use cases

### Complex question answering

When a question can't be answered from a single source — comparative analyses, multi-factor evaluations, questions that span multiple domains — the Research API handles the synthesis for you.

```python
import requests

API_KEY = "api_key"

response = requests.post(
    "https://api.you.com/v1/research",
    headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},
    json={
        "input": "Compare the pricing models of the top 3 vector databases and their tradeoffs for a 10M-document collection",
        "research_effort": "deep",
    },
)

data = response.json()
print(data["output"]["content"])
```

### Due diligence and market research

Quickly gather verified, cited information about companies, markets, or technologies. The citation-backed output gives you traceability that raw LLM generation can't.

### Internal tools and knowledge assistants

Build internal research tools where employees can ask complex questions and get sourced answers — product comparisons, regulatory summaries, technical deep dives — without manually reading dozens of pages.

### Content creation pipelines

Use the Research API as the first step in a content pipeline: ask a research question, get a cited draft, then use it as source material for blog posts, reports, or briefings.

***

## Best practices

### Match research effort to the question

Don't use `exhaustive` for simple factual questions — `lite` or `standard` will be faster and cheaper. Save `deep` and `exhaustive` for questions where thoroughness and accuracy justify the longer response time.

### Verify citations for high-stakes use cases

The inline citations make verification straightforward. For legal, financial, or medical contexts, build a step that follows citation URLs to confirm claims before surfacing them to end users.

### Use structured inputs for better results

The `input` field supports up to 40,000 characters. For complex research tasks, include context, constraints, or specific angles you want covered. A well-scoped question produces a more focused answer.

***

## Pricing

Pricing is fixed per tier — see the [research effort levels table](#research-effort-levels) above for per-tier pricing and latency. For more details, visit [https://you.com/pricing](https://you.com/pricing)) or contact [api@you.com](mailto:api@you.com).

***

## Try it

<Card title="Research template" icon="fa-regular fa-microscope" href="/examples/research">
  See a working app that runs in-depth research and returns answers with citations.
</Card>

***

## Next steps

<CardGroup cols={2}>
  <Card title="API Reference" icon="fa-regular fa-code" href="/api-reference/research/v1-research">
    Full parameter reference, request/response schemas and interactive playground
  </Card>

  <Card title="Try the Search API" icon="fa-regular fa-search" href="/search/overview">
    Get raw search results for your own pipelines instead of synthesized answers
  </Card>

  <Card title="Quickstart" icon="fa-regular fa-play" href="/quickstart">
    Get your API key and try all our APIs in under five minutes
  </Card>
</CardGroup>
