import { getAnthropicModel } from '@/lib/providers/anthropic'

export function getModel(apiKey: string, modelId: string) {
	return getAnthropicModel(apiKey, modelId)
}

export function validateApiKey(apiKey: string): boolean {
	return /^sk-ant-/.test(apiKey)
}
