import { jsonSchema } from 'ai'
import type { ResearchResult } from '@/lib/types'

export const researchSystemPrompt = `You are a domain research specialist preparing context for NanoFleet Agent Pack generation.

Given an agent context, use web search to find real, current information:
1. Standard tools and technologies used in this domain (search for them explicitly)
2. Domain-specific vocabulary and terminology
3. Typical workflows and methodologies practitioners use
4. Best practices and industry standards
5. Common use cases and pain points

Search multiple times as needed to cover different aspects of the domain. Then write a comprehensive research summary covering all of the above, plus propose 2–6 specific skills for the agent. Each proposed skill should be:
- Named in kebab-case (e.g., "vulnerability-report", "code-review-checklist")
- Described with enough detail to generate meaningful content

Also note whether the request mentions periodic, recurring, or scheduled tasks (e.g., "monitor every morning", "weekly report", "daily check").

Write your research notes in free prose — they will be structured in a follow-up step.`

export const researchStructurePrompt = `Extract structured research data from the research notes below and fill each field precisely.

- domainSummary: concise summary of the domain and agent role
- keyTools: specific tools, frameworks, CLIs, APIs found in the research
- suggestedSkills: 2–6 proposed skills in "skill-name: one-sentence description" format
- additionalContext: any other relevant domain context for generation
- needsHeartbeat: true only if the agent has periodic/recurring/scheduled tasks

Respond ONLY with the structured JSON output.`

export const researchSchema = jsonSchema<ResearchResult>({
	type: 'object',
	properties: {
		domainSummary: {
			type: 'string',
			description: 'Concise summary of the domain and agent role',
		},
		keyTools: {
			type: 'array',
			items: { type: 'string' },
			description: 'Tools, technologies, and frameworks common in this domain',
		},
		suggestedSkills: {
			type: 'array',
			items: { type: 'string' },
			description:
				'Proposed skill names and descriptions in format "skill-name: description"',
		},
		additionalContext: {
			type: 'string',
			description: 'Any other relevant domain context for generation',
		},
		needsHeartbeat: {
			type: 'boolean',
			description: 'True if the agent has periodic/recurring tasks',
		},
	},
	required: [
		'domainSummary',
		'keyTools',
		'suggestedSkills',
		'additionalContext',
		'needsHeartbeat',
	],
	additionalProperties: false,
})
