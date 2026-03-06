import { jsonSchema } from 'ai'
import { z } from 'zod'

export function buildGenerateSystemPrompt(skillCreatorBlock: string): string {
	return `You are an Agent Pack creator expert. Generate a complete, production-ready agent pack based on the provided context and research.

<agent_pack_overview>
An Agent Pack defines an AI agent through four file types: SOUL.md (identity), STYLE.md (communication), skills/{name}/SKILL.md (capabilities), and optionally HEARTBEAT.md (periodic tasks). Each file should be detailed, actionable, and grounded in domain-specific vocabulary from the research.
</agent_pack_overview>

<file_specifications>

## SOUL.md
Define the agent's identity in rich, specific terms:
- Who this agent is (role, persona, name if applicable)
- Core expertise and knowledge domains
- Values, principles, and approach to work
- Clear boundaries (what this agent does and does not do)
- How it handles uncertainty or out-of-scope requests

## STYLE.md
Define communication style:
- Tone (formal/casual/technical/friendly)
- Response format preferences (lists, prose, code blocks)
- Language (default language, technical vocabulary usage)
- Response length guidelines
- Domain-specific formatting conventions

## skills/{name}/SKILL.md
Each skill is a SKILL.md file. Use the skill-creator skill (see <available_skills> below) as the authoritative guide for writing each skill — follow its Skill Writing Guide, writing patterns, and description calibration rules precisely.

## HEARTBEAT.md
Free-form markdown describing what the agent should do each time the heartbeat triggers. If the agent has no periodic tasks, omit this field entirely.

Include:
- What to check or monitor
- What to summarize or produce
- How to report or store results

Omit schedule or cron expressions — timing is controlled externally via the HEARTBEAT_INTERVAL environment variable.

</file_specifications>

<available_skills>
${skillCreatorBlock}
</available_skills>

<instructions>
1. Review the provided agent context and domain research.
2. Generate SOUL.md with a specific, well-defined identity grounded in the domain.
3. Generate STYLE.md with communication guidelines tailored to the agent's audience.
4. Use the skill-creator skill to generate 2-6 skills based on the suggested skills from research. For each skill, apply the skill-creator's Skill Writing Guide: write a well-calibrated description, classify the type (capability-uplift or encoded-preference), list only the tools the skill actually needs, use imperative instructions, apply progressive disclosure (overview first, details after), and keep each SKILL.md under 500 lines.
5. Generate HEARTBEAT.md only if the research indicates periodic tasks; otherwise omit the field.
6. Set agentName to a clean kebab-case slug (e.g., "web-security-researcher").
</instructions>

<output_format>
Return structured JSON matching the schema with all pack files populated. Use domain-specific vocabulary and reference real tools from the research throughout.
</output_format>`
}

export const skillSchema = z.object({
	name: z.string().describe('Kebab-case skill folder name'),
	type: z.enum(['capability-uplift', 'encoded-preference']),
	content: z
		.string()
		.describe('Full SKILL.md content including YAML frontmatter'),
})

export const packFilesSchema = z.object({
	agentName: z.string().describe('Kebab-case agent name for the zip filename'),
	soul: z.string().describe('Full content of SOUL.md'),
	style: z.string().describe('Full content of STYLE.md'),
	heartbeat: z
		.string()
		.optional()
		.describe('Full content of HEARTBEAT.md — only if periodic tasks detected'),
	skills: z.array(skillSchema).min(2).max(6),
})

export type PackFilesSchema = z.infer<typeof packFilesSchema>

export const packFilesJsonSchema = jsonSchema<PackFilesSchema>({
	type: 'object',
	properties: {
		agentName: {
			type: 'string',
			description: 'Kebab-case agent name for the zip filename',
		},
		soul: { type: 'string', description: 'Full content of SOUL.md' },
		style: { type: 'string', description: 'Full content of STYLE.md' },
		heartbeat: {
			type: 'string',
			description:
				'Full content of HEARTBEAT.md — only if periodic tasks detected',
		},
		skills: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					name: { type: 'string', description: 'Kebab-case skill folder name' },
					type: {
						type: 'string',
						enum: ['capability-uplift', 'encoded-preference'],
					},
					content: {
						type: 'string',
						description: 'Full SKILL.md content including YAML frontmatter',
					},
				},
				required: ['name', 'type', 'content'],
				additionalProperties: false,
			},
		},
	},
	required: ['agentName', 'soul', 'style', 'skills'],
	additionalProperties: false,
})
