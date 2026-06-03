import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export interface DocumentSummary {
  summary: string
  keyPoints: string[]
  tags: string[]
  sentiment: string
}

export interface ContractAnalysis {
  parties: string[]
  effectiveDate: string | null
  expirationDate: string | null
  keyObligations: string[]
  risks: string[]
  summary: string
}

export interface RiskAssessment {
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  risks: Array<{ description: string; severity: string; recommendation: string }>
  overallScore: number
}

export interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

export interface DMSContext {
  organizationId?: string
  repositoryId?: string
  userId?: string
}

export async function generateDocumentSummary(text: string): Promise<DocumentSummary> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a document analysis assistant. Return valid JSON only.",
      },
      {
        role: "user",
        content: `Analyze this document and return a JSON object with:
- summary: 2-3 sentence summary
- keyPoints: array of 5 key points
- tags: array of 5 relevant tags
- sentiment: "positive", "negative", or "neutral"

Document text:
${text.slice(0, 4000)}`,
      },
    ],
    response_format: { type: "json_object" },
  })

  const content = response.choices[0].message.content ?? "{}"
  const parsed = JSON.parse(content)
  return {
    summary: parsed.summary ?? "",
    keyPoints: parsed.keyPoints ?? [],
    tags: parsed.tags ?? [],
    sentiment: parsed.sentiment ?? "neutral",
  }
}

export async function extractKeyPoints(text: string): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Extract key points from documents. Return JSON." },
      {
        role: "user",
        content: `Extract the 7 most important points from this document as a JSON array of strings:
${text.slice(0, 4000)}`,
      },
    ],
    response_format: { type: "json_object" },
  })

  const content = response.choices[0].message.content ?? "{}"
  const parsed = JSON.parse(content)
  return parsed.keyPoints ?? parsed.points ?? []
}

export async function suggestTags(text: string, existingTags: string[]): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Suggest relevant tags for documents. Return JSON." },
      {
        role: "user",
        content: `Suggest 8 tags for this document. Existing tags: ${existingTags.join(", ")}
Return JSON: {"tags": ["tag1", "tag2"...]}

Document:
${text.slice(0, 2000)}`,
      },
    ],
    response_format: { type: "json_object" },
  })

  const content = response.choices[0].message.content ?? "{}"
  const parsed = JSON.parse(content)
  return (parsed.tags ?? []).filter((t: string) => !existingTags.includes(t))
}

export async function analyzeContract(text: string): Promise<ContractAnalysis> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Analyze contracts and extract structured information. Return JSON." },
      {
        role: "user",
        content: `Analyze this contract and return JSON with:
- parties: array of party names
- effectiveDate: date string or null
- expirationDate: date string or null
- keyObligations: array of key obligations
- risks: array of risk descriptions
- summary: brief summary

Contract:
${text.slice(0, 6000)}`,
      },
    ],
    response_format: { type: "json_object" },
  })

  const content = response.choices[0].message.content ?? "{}"
  const parsed = JSON.parse(content)
  return {
    parties: parsed.parties ?? [],
    effectiveDate: parsed.effectiveDate ?? null,
    expirationDate: parsed.expirationDate ?? null,
    keyObligations: parsed.keyObligations ?? [],
    risks: parsed.risks ?? [],
    summary: parsed.summary ?? "",
  }
}

export async function detectRisks(text: string): Promise<RiskAssessment> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Identify risks in documents. Return JSON." },
      {
        role: "user",
        content: `Identify risks in this document and return JSON:
{
  "level": "LOW|MEDIUM|HIGH|CRITICAL",
  "overallScore": 0-100,
  "risks": [{"description": "...", "severity": "LOW|MEDIUM|HIGH", "recommendation": "..."}]
}

Document:
${text.slice(0, 4000)}`,
      },
    ],
    response_format: { type: "json_object" },
  })

  const content = response.choices[0].message.content ?? "{}"
  const parsed = JSON.parse(content)
  return {
    level: parsed.level ?? "LOW",
    risks: parsed.risks ?? [],
    overallScore: parsed.overallScore ?? 0,
  }
}

export async function* chatWithDMS(
  messages: Message[],
  context: DMSContext
): AsyncIterable<string> {
  const systemPrompt = `You are an AI assistant for LookUp DMS, an enterprise document management system.
You help users find documents, understand content, manage workflows, and navigate the system.
Context: Organization ID: ${context.organizationId ?? "N/A"}, Repository ID: ${context.repositoryId ?? "N/A"}.
Be concise, professional, and helpful. Format responses with markdown when appropriate.`

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    stream: true,
  })

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) yield delta
  }
}
