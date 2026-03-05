import { generateObject } from 'ai'
import {
	refineJsonSchema,
	refineSystemPrompt,
} from '@/lib/prompts/refine.prompt'
import type { PackFiles, RefineResult } from '@/lib/types'

export async function runRefine(
	currentPack: PackFiles,
	instruction: string,
	history: string[],
	model: Parameters<typeof generateObject>[0]['model'],
): Promise<RefineResult> {
	const historyContext =
		history.length > 0
			? `\n\n## Previous refinements\n${history.map((h, i) => `${i + 1}. ${h}`).join('\n')}`
			: ''

	const userMessage = `
## Current Pack
Agent: ${currentPack.agentName}

### SOUL.md
${currentPack.soul}

### STYLE.md
${currentPack.style}

${currentPack.heartbeat ? `### HEARTBEAT.md\n${currentPack.heartbeat}\n` : ''}

### Skills
${currentPack.skills.map((s) => `**${s.name}** (${s.type}):\n${s.content}`).join('\n\n')}
${historyContext}

## Refinement instruction
${instruction}
`.trim()

	const { object } = await generateObject({
		model,
		schema: refineJsonSchema,
		system: refineSystemPrompt,
		messages: [{ role: 'user', content: userMessage }],
	})

	return object as RefineResult
}

export function mergeRefinement(
	currentPack: PackFiles,
	result: RefineResult,
): PackFiles {
	// Filter out null values — only merge fields that were actually updated
	const nonNullFields = Object.fromEntries(
		Object.entries(result.updatedPack).filter(([, v]) => v !== null),
	)
	const updated = { ...currentPack, ...nonNullFields }

	if (result.updatedPack.skills) {
		const updatedSkillNames = new Set(
			result.updatedPack.skills.map((s) => s.name),
		)
		const unchangedSkills = currentPack.skills.filter(
			(s) => !updatedSkillNames.has(s.name),
		)
		updated.skills = [...unchangedSkills, ...result.updatedPack.skills]
	}

	return updated
}
