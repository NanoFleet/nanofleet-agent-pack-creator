import { createAnthropic } from '@ai-sdk/anthropic'
import { generateObject, generateText, stepCountIs } from 'ai'
import {
	researchSchema,
	researchStructurePrompt,
	researchSystemPrompt,
} from '@/lib/prompts/research.prompt'
import { getAnthropicModel } from '@/lib/providers/anthropic'
import type { ResearchResult } from '@/lib/types'

function makeAnthropic(apiKey: string) {
	const baseURL = import.meta.env.DEV
		? '/api/anthropic/v1'
		: 'https://api.anthropic.com/v1'
	return createAnthropic({ apiKey, baseURL })
}

export async function runResearch(
	enrichedContext: string,
	clarifications: string,
	apiKey: string,
	modelId: string,
): Promise<ResearchResult> {
	const userMessage = clarifications
		? `Agent context:\n${enrichedContext}\n\nClarifications from user:\n${clarifications}`
		: `Agent context:\n${enrichedContext}`

	// Phase 1: web search to gather real domain knowledge
	const anthropic = makeAnthropic(apiKey)
	const { text: researchNotes } = await generateText({
		model: anthropic(modelId),
		tools: { web_search: anthropic.tools.webSearch_20250305({ maxUses: 5 }) },
		stopWhen: stepCountIs(8),
		system: researchSystemPrompt,
		messages: [{ role: 'user', content: userMessage }],
	})

	// Phase 2: structure the research notes into ResearchResult
	const { object } = await generateObject({
		model: getAnthropicModel(apiKey, modelId),
		schema: researchSchema,
		system: researchStructurePrompt,
		messages: [{ role: 'user', content: researchNotes }],
	})

	return object
}
