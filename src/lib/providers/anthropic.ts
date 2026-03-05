import { createAnthropic } from '@ai-sdk/anthropic'

export function getAnthropicModel(apiKey: string, modelId: string) {
	const baseURL = '/api/anthropic/v1'
	return createAnthropic({ apiKey, baseURL })(modelId)
}
