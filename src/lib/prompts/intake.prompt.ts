import { jsonSchema } from 'ai'
import type { IntakeResult } from '@/lib/types'

export const intakeSystemPrompt = `You are an expert at designing NanoFleet Agent Packs.

A NanoFleet Agent Pack is a structured collection of files that define an AI agent's identity, communication style, and skills:
- SOUL.md: The agent's identity, values, expertise, boundaries, and personality
- STYLE.md: How the agent communicates — tone, format, language, response length
- skills/{name}/SKILL.md: Specific capabilities or workflows the agent can perform (2–6 skills)
- HEARTBEAT.md: Periodic/scheduled tasks (only if the agent has recurring duties)

Your job is to ask 2–3 short, targeted clarifying questions before proceeding — even if the request seems clear. Good questions lead to better packs.

Focus your questions on understanding:
1. The agent's domain and role (who is this agent? what does it do?)
2. The expected tone and communication style (formal? casual? technical?)
3. The main use cases and workflows the agent should handle

Always respond with status "questions" and a list of 2–3 targeted questions.

Respond ONLY with the structured JSON output. No prose.`

export const intakeSchema = jsonSchema<IntakeResult>({
	type: 'object',
	properties: {
		status: {
			type: 'string',
			enum: ['ready', 'questions'],
			description:
				'"ready" if enough info to proceed, "questions" if clarification needed',
		},
		enrichedContext: {
			anyOf: [{ type: 'string' }, { type: 'null' }],
			description:
				'A detailed summary of the agent context ready for research and generation — required when status is "ready", null otherwise',
		},
		questions: {
			anyOf: [{ type: 'array', items: { type: 'string' } }, { type: 'null' }],
			description:
				'Targeted clarification questions — required when status is "questions", null otherwise',
		},
	},
	required: ['status', 'enrichedContext', 'questions'],
	additionalProperties: false,
})
