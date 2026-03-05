import { jsonSchema } from 'ai'
import { z } from 'zod'

export const refineSystemPrompt = `You are refining an existing NanoFleet Agent Pack based on a user instruction.

Your job:
1. Analyze the refinement instruction to identify WHICH files need to change
2. Re-generate ONLY the affected files — do not touch unchanged files
3. Preserve all unchanged content exactly as-is
4. Provide a brief summary of what changed and why

For skills: if the instruction mentions adding a new skill, add it to the skills array in updatedPack. If modifying an existing skill, include only that skill in updatedPack.skills.

changedFiles should list: "soul", "style", "heartbeat", or skill names (e.g., "vulnerability-report").

Respond ONLY with the structured JSON output.`

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
