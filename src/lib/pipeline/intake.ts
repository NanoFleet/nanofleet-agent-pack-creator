import { generateObject } from 'ai'
import { buildAttachmentsContext } from '@/lib/files'
import { intakeSchema, intakeSystemPrompt } from '@/lib/prompts/intake.prompt'
import type { AttachedFile, IntakeResult } from '@/lib/types'

export async function runIntake(
	request: string,
	files: AttachedFile[],
	model: Parameters<typeof generateObject>[0]['model'],
): Promise<IntakeResult> {
	const attachmentsContext = buildAttachmentsContext(files)
	const userMessage = `${request}${attachmentsContext}`

	const { object } = await generateObject({
		model,
		schema: intakeSchema,
		system: intakeSystemPrompt,
		messages: [{ role: 'user', content: userMessage }],
	})

	return object as IntakeResult
}
