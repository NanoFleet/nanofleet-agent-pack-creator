export type AnthropicModel =
	| 'claude-opus-4-6'
	| 'claude-sonnet-4-6'
	| 'claude-haiku-4-5'

export type PipelineState =
	| 'idle'
	| 'intake'
	| 'clarifying'
	| 'researching'
	| 'generating'
	| 'done'
	| 'refining'
	| 'error'

export type AttachedFile = {
	name: string
	size: number
	mimeType: string
} & (
	| { encoding: 'text'; content: string }
	| { encoding: 'base64'; content: string }
)

export type IntakeResult =
	| { status: 'ready'; enrichedContext: string }
	| { status: 'questions'; questions: string[] }

export type ResearchResult = {
	domainSummary: string
	keyTools: string[]
	suggestedSkills: string[]
	additionalContext: string
	needsHeartbeat: boolean
}

export type SkillType = 'capability-uplift' | 'encoded-preference'

export type Skill = {
	name: string
	type: SkillType
	content: string
}

export type PackFiles = {
	agentName: string
	soul: string
	style: string
	heartbeat?: string
	skills: Skill[]
}

export type RefineHistoryEntry = {
	instruction: string
	summary: string
	changedFiles: string[]
	timestamp: Date
}

export type RefineResult = {
	changedFiles: Array<'soul' | 'style' | 'heartbeat' | string>
	updatedPack: Partial<PackFiles>
	summary: string
}
