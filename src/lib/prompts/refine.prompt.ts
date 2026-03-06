import { jsonSchema } from 'ai'
import { z } from 'zod'

export const refineSystemPrompt = `You are an expert NanoFleet Agent Pack editor. Your role is to apply targeted refinements to an existing agent pack based on user instructions.

<context>
The refinement system uses partial updates: you return only the files that changed. Null fields in updatedPack are left untouched during the merge. For skills, only the skills you include in updatedPack.skills are replaced or added — all other existing skills are preserved automatically.
</context>

<instructions>
1. Read the refinement instruction carefully.
2. Identify which files need to change — most refinements affect only 1-2 files.
3. Re-generate only the affected files with the requested changes applied.
4. List every changed file in changedFiles.
5. Write a brief summary explaining what changed and why.
</instructions>

<valid_file_keys>
changedFiles values can be:
- "soul" — for changes to SOUL.md
- "style" — for changes to STYLE.md
- "heartbeat" — for changes to HEARTBEAT.md
- A skill name in kebab-case (e.g., "vulnerability-report") — for changes to that specific skill
</valid_file_keys>

<skills_handling>
- To modify an existing skill: include the updated skill object in updatedPack.skills with the same name.
- To add a new skill: include the new skill object in updatedPack.skills.
- To leave a skill unchanged: omit it from updatedPack.skills entirely. It will be preserved as-is.
- To remove a skill: this is not supported through refinement. Only modify or add.
</skills_handling>

<example>
If the user says "Make the tone more casual and add emoji to responses":
{
  "changedFiles": ["style"],
  "updatedPack": {
    "agentName": null,
    "soul": null,
    "style": "# Communication Style\\n\\nTone: Casual and friendly, with liberal use of emoji...",
    "heartbeat": null,
    "skills": null
  },
  "summary": "Updated STYLE.md to use a more casual tone with emoji throughout responses."
}
</example>

<output_format>
Return structured JSON matching the schema. Include only modified files in updatedPack; set unchanged fields to null.
</output_format>`

export const refineSchema = z.object({
	changedFiles: z
		.array(z.string())
		.describe(
			'List of changed file keys: "soul", "style", "heartbeat", or skill names',
		),
	updatedPack: z
		.object({
			agentName: z.string().optional(),
			soul: z.string().optional(),
			style: z.string().optional(),
			heartbeat: z.string().optional(),
			skills: z
				.array(
					z.object({
						name: z.string(),
						type: z.enum(['capability-uplift', 'encoded-preference']),
						content: z.string(),
					}),
				)
				.optional(),
		})
		.describe('Partial pack with only the modified files'),
	summary: z.string().describe('Short description of what was changed'),
})

export type RefineSchema = z.infer<typeof refineSchema>

export const refineJsonSchema = jsonSchema<RefineSchema>({
	type: 'object',
	properties: {
		changedFiles: {
			type: 'array',
			items: { type: 'string' },
			description:
				'List of changed file keys: "soul", "style", "heartbeat", or skill names',
		},
		updatedPack: {
			type: 'object',
			description:
				'Partial pack with only the modified files — null for unchanged fields',
			properties: {
				agentName: { anyOf: [{ type: 'string' }, { type: 'null' }] },
				soul: { anyOf: [{ type: 'string' }, { type: 'null' }] },
				style: { anyOf: [{ type: 'string' }, { type: 'null' }] },
				heartbeat: { anyOf: [{ type: 'string' }, { type: 'null' }] },
				skills: {
					anyOf: [
						{
							type: 'array',
							items: {
								type: 'object',
								properties: {
									name: { type: 'string' },
									type: {
										type: 'string',
										enum: ['capability-uplift', 'encoded-preference'],
									},
									content: { type: 'string' },
								},
								required: ['name', 'type', 'content'],
								additionalProperties: false,
							},
						},
						{ type: 'null' },
					],
				},
			},
			required: ['agentName', 'soul', 'style', 'heartbeat', 'skills'],
			additionalProperties: false,
		},
		summary: {
			type: 'string',
			description: 'Short description of what was changed',
		},
	},
	required: ['changedFiles', 'updatedPack', 'summary'],
	additionalProperties: false,
})
