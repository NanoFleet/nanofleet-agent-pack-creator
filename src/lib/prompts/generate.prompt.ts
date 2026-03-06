import { jsonSchema } from 'ai'
import { z } from 'zod'

export const generateSystemPrompt = `You are an Agent Pack creator expert. Generate a complete, production-ready agent pack based on the provided context and research.

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
Each skill file uses YAML frontmatter followed by markdown instructions:

<example title="YAML frontmatter format">
---
name: code-review
description: Review pull requests for bugs, style violations, and security issues
tools:
  - readFile
  - webSearch
---

Step-by-step instructions for performing this skill...
</example>

## HEARTBEAT.md
Free-form markdown describing what the agent should do each time the heartbeat triggers. If the agent has no periodic tasks, omit this field entirely.

Include:
- What to check or monitor
- What to summarize or produce
- How to report or store results

Omit schedule or cron expressions — timing is controlled externally via the HEARTBEAT_INTERVAL environment variable.

</file_specifications>

<skill_calibration>
Skill descriptions in the YAML frontmatter control when a skill activates. Calibrate them carefully:
- Too broad ("Help with security") causes false positives — the skill triggers when it should not.
- Too narrow ("Write CVE report for PHP SQL injection via nuclei") means the skill almost never triggers.
- Well-calibrated descriptions state the WHEN and WHAT in 1-2 sentences without over-specifying the HOW.

<example title="well-calibrated description">
description: Analyze web application vulnerabilities and produce structured security reports with severity ratings and remediation steps
</example>

<example title="too broad">
description: Help with security things
</example>

<example title="too narrow">
description: Run nuclei scanner against PHP apps to find SQL injection CVEs and format as CVSS 3.1 report
</example>
</skill_calibration>

<skill_types>
Classify each skill as one of two types:
- capability-uplift: Teaches the agent something it could not do reliably without this skill — specific techniques, proprietary formats, complex workflows. May become obsolete as models improve.
- encoded-preference: Sequences actions the agent could do individually, but in a specific order, style, or convention relevant to this user's context. Durable because it encodes human choices, not model limitations.
</skill_types>

<instructions>
1. Review the provided agent context and domain research.
2. Generate SOUL.md with a specific, well-defined identity grounded in the domain.
3. Generate STYLE.md with communication guidelines tailored to the agent's audience.
4. Generate 2-6 skills based on the suggested skills from research. For each skill:
   a. Write a well-calibrated description (see skill_calibration above).
   b. Classify as capability-uplift or encoded-preference.
   c. List only the tools the skill actually needs in the frontmatter.
   d. Write detailed, imperative instructions ("Run the scanner", not "The agent should run").
   e. Structure for progressive disclosure: overview first, details after.
   f. Keep each SKILL.md under 500 lines.
5. Generate HEARTBEAT.md only if the research indicates periodic tasks; otherwise omit the field.
6. Set agentName to a clean kebab-case slug (e.g., "web-security-researcher").
</instructions>

<output_format>
Return structured JSON matching the schema with all pack files populated. Use domain-specific vocabulary and reference real tools from the research throughout.
</output_format>`

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
