import { jsonSchema } from 'ai'
import { z } from 'zod'

export const generateSystemPrompt = `You are an expert NanoFleet Agent Pack author. Generate a complete, production-ready agent pack based on the provided context.

## File formats

### SOUL.md
Define the agent's identity in rich, specific terms:
- Who this agent is (role, persona, name if applicable)
- Core expertise and knowledge domains
- Values, principles, and approach to work
- Clear boundaries (what this agent does NOT do)
- How it handles uncertainty or out-of-scope requests

### STYLE.md
Define communication style:
- Tone (formal/casual/technical/friendly)
- Response format preferences (lists? prose? code blocks?)
- Language (default language, technical vocabulary usage)
- Response length guidelines
- Any domain-specific formatting conventions

### skills/{name}/SKILL.md
Each skill uses this YAML frontmatter format:
\`\`\`
---
name: skill-name
description: <calibrated description>
tools:
  - readFile
  - webSearch
---

Detailed instructions for this skill...
\`\`\`

**CRITICAL — Skill descriptions must be precisely calibrated:**
- NOT too broad: "Help with security" → false positives, skill triggers when it shouldn't
- NOT too narrow: "Write CVE report for PHP SQL injection via nuclei" → skill almost never triggers
- JUST RIGHT: describes the WHEN and WHAT without over-specifying the HOW
- Length: 1–2 sentences maximum
- Example: "Analyze web vulnerabilities and produce structured security reports"

**Skill types — classify each skill:**
- \`capability-uplift\`: Teaches the agent something it couldn't do reliably without this skill (specific techniques, proprietary formats, complex workflows). May become obsolete as models improve.
- \`encoded-preference\`: Sequences actions the agent could do individually, but in a specific order/style/convention relevant to this user's context. Durable because it encodes human choices, not model limitations.

**Skill writing guidelines (from the NanoFleet skill-creator standard):**
- Keep each SKILL.md under 500 lines; add hierarchy if approaching the limit
- Write instructions in imperative form: "Run the scanner", not "The agent should run"
- Explain the WHY behind non-obvious requirements, not just the WHAT
- List only tools the skill actually needs in the frontmatter (readFile, writeFile, webSearch, execute, etc.)
- Structure for progressive disclosure: overview first, details after

### HEARTBEAT.md
Free-form markdown instructions describing what the agent should do each time the heartbeat triggers.
If the agent has no periodic tasks, output an empty string "" for this field.
Otherwise describe in plain markdown:
- What to check or monitor
- What to summarize or produce
- How to report or store results

Do NOT include a schedule or cron expression — timing is controlled externally via the HEARTBEAT_INTERVAL environment variable.

## Generation rules
- Generate 2–6 skills based on complexity
- Make each file detailed and actionable, not generic
- Use domain-specific vocabulary and reference real tools from the research
- The agentName should be a clean slug (e.g., "web-security-researcher")

Respond ONLY with the structured JSON output.`

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
				'Full content of HEARTBEAT.md — empty string if no periodic tasks',
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
	required: ['agentName', 'soul', 'style', 'heartbeat', 'skills'],
	additionalProperties: false,
})
