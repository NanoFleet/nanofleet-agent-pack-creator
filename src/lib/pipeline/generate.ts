import { generateObject } from 'ai'
import {
	generateSystemPrompt,
	packFilesJsonSchema,
} from '@/lib/prompts/generate.prompt'
import type { IntakeResult, PackFiles, ResearchResult } from '@/lib/types'

export async function runGenerate(
	intakeResult: IntakeResult,
	researchResult: ResearchResult,
	model: Parameters<typeof generateObject>[0]['model'],
): Promise<PackFiles> {
	const enrichedContext =
		intakeResult.status === 'ready' ? intakeResult.enrichedContext : ''

	const userMessage = `
## Agent Context
${enrichedContext}

## Domain Research
${researchResult.domainSummary}

## Key Tools in this Domain
${researchResult.keyTools.join(', ')}

## Suggested Skills
${researchResult.suggestedSkills.join('\n')}

## Additional Context
${researchResult.additionalContext}

## Configuration
- Generate HEARTBEAT.md: ${researchResult.needsHeartbeat ? 'YES — agent has periodic tasks' : 'NO'}
`.trim()

	const { object } = await generateObject({
		model,
		schema: packFilesJsonSchema,
		system: generateSystemPrompt,
		messages: [{ role: 'user', content: userMessage }],
	})

	return object as PackFiles
}
