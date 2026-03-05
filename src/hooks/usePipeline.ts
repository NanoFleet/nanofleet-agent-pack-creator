import { useCallback, useReducer } from 'react'
import { getModel } from '@/lib/llm'
import { runGenerate } from '@/lib/pipeline/generate'
import { runIntake } from '@/lib/pipeline/intake'
import { mergeRefinement, runRefine } from '@/lib/pipeline/refine'
import { runResearch } from '@/lib/pipeline/research'
import type {
	AnthropicModel,
	AttachedFile,
	IntakeResult,
	PackFiles,
	PipelineState,
	RefineHistoryEntry,
	ResearchResult,
} from '@/lib/types'

type State = {
	status: PipelineState
	packFiles: PackFiles | null
	questions: string[] | null
	refineHistory: RefineHistoryEntry[]
	error: string | null
	// internal context carried between phases
	_intakeResult: IntakeResult | null
	_researchResult: ResearchResult | null
}

type Action =
	| { type: 'START_INTAKE' }
	| { type: 'NEEDS_CLARIFICATION'; questions: string[] }
	| { type: 'START_RESEARCH'; intakeResult: IntakeResult }
	| { type: 'START_GENERATING'; researchResult: ResearchResult }
	| { type: 'DONE'; packFiles: PackFiles }
	| { type: 'START_REFINING' }
	| { type: 'REFINE_DONE'; packFiles: PackFiles; entry: RefineHistoryEntry }
	| { type: 'ERROR'; error: string }
	| { type: 'RESET' }

const initialState: State = {
	status: 'idle',
	packFiles: null,
	questions: null,
	refineHistory: [],
	error: null,
	_intakeResult: null,
	_researchResult: null,
}

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case 'START_INTAKE':
			return { ...state, status: 'intake', error: null }
		case 'NEEDS_CLARIFICATION':
			return { ...state, status: 'clarifying', questions: action.questions }
		case 'START_RESEARCH':
			return {
				...state,
				status: 'researching',
				_intakeResult: action.intakeResult,
			}
		case 'START_GENERATING':
			return {
				...state,
				status: 'generating',
				_researchResult: action.researchResult,
			}
		case 'DONE':
			return { ...state, status: 'done', packFiles: action.packFiles }
		case 'START_REFINING':
			return { ...state, status: 'refining', error: null }
		case 'REFINE_DONE':
			return {
				...state,
				status: 'done',
				packFiles: action.packFiles,
				refineHistory: [...state.refineHistory, action.entry],
			}
		case 'ERROR':
			return { ...state, status: 'error', error: action.error }
		case 'RESET':
			return initialState
		default:
			return state
	}
}

function formatError(err: unknown): string {
	if (err instanceof Error) {
		if (err.message.includes('401') || err.message.includes('Unauthorized')) {
			return 'Invalid API key. Please check your key and try again.'
		}
		if (err.message.includes('429') || err.message.includes('quota')) {
			return 'API quota exceeded. Please check your account limits.'
		}
		if (err.message.includes('network') || err.message.includes('fetch')) {
			return 'Network error. Please check your connection and try again.'
		}
		return err.message
	}
	return 'An unexpected error occurred.'
}

export function usePipeline({
	model,
	apiKey,
}: {
	model: AnthropicModel
	apiKey: string
}) {
	const [state, dispatch] = useReducer(reducer, initialState)

	const runPhase2And3 = useCallback(
		async (intakeResult: IntakeResult, clarifications = '') => {
			const llmModel = getModel(apiKey, model)
			try {
				dispatch({ type: 'START_RESEARCH', intakeResult })
				const enrichedContext =
					intakeResult.status === 'ready' ? intakeResult.enrichedContext : ''
				const researchResult = await runResearch(
					enrichedContext,
					clarifications,
					apiKey,
					model,
				)

				dispatch({ type: 'START_GENERATING', researchResult })
				const packFiles = await runGenerate(
					intakeResult,
					researchResult,
					llmModel,
				)

				dispatch({ type: 'DONE', packFiles })
			} catch (err) {
				dispatch({ type: 'ERROR', error: formatError(err) })
			}
		},
		[model, apiKey],
	)

	const submit = useCallback(
		async (request: string, files: AttachedFile[]) => {
			const llmModel = getModel(apiKey, model)
			dispatch({ type: 'START_INTAKE' })
			try {
				const intakeResult = await runIntake(request, files, llmModel)

				if (intakeResult.status === 'questions') {
					dispatch({
						type: 'NEEDS_CLARIFICATION',
						questions: intakeResult.questions,
					})
				} else {
					await runPhase2And3(intakeResult)
				}
			} catch (err) {
				dispatch({ type: 'ERROR', error: formatError(err) })
			}
		},
		[model, apiKey, runPhase2And3],
	)

	const answerQuestions = useCallback(
		async (answers: string[]) => {
			if (!state._intakeResult && state.questions) {
				// Construct a synthetic intake result from original questions + answers
				const clarifications = state.questions
					.map((q, i) => `Q: ${q}\nA: ${answers[i] ?? ''}`)
					.join('\n\n')

				const syntheticIntake: IntakeResult = {
					status: 'ready',
					enrichedContext: clarifications,
				}
				await runPhase2And3(syntheticIntake, clarifications)
			} else if (state._intakeResult) {
				const clarifications = (state.questions ?? [])
					.map((q, i) => `Q: ${q}\nA: ${answers[i] ?? ''}`)
					.join('\n\n')
				await runPhase2And3(state._intakeResult, clarifications)
			}
		},
		[state._intakeResult, state.questions, runPhase2And3],
	)

	const refine = useCallback(
		async (instruction: string) => {
			if (!state.packFiles) return
			const llmModel = getModel(apiKey, model)
			dispatch({ type: 'START_REFINING' })

			try {
				const historyStrings = state.refineHistory.map((h) => h.instruction)
				const refineResult = await runRefine(
					state.packFiles,
					instruction,
					historyStrings,
					llmModel,
				)
				const updatedPack = mergeRefinement(state.packFiles, refineResult)

				dispatch({
					type: 'REFINE_DONE',
					packFiles: updatedPack,
					entry: {
						instruction,
						summary: refineResult.summary,
						changedFiles: refineResult.changedFiles,
						timestamp: new Date(),
					},
				})
			} catch (err) {
				dispatch({ type: 'ERROR', error: formatError(err) })
			}
		},
		[state.packFiles, state.refineHistory, model, apiKey],
	)

	const reset = useCallback(() => {
		dispatch({ type: 'RESET' })
	}, [])

	const currentPhaseLabel = {
		idle: '',
		intake: 'Analyzing request',
		clarifying: 'Waiting for clarifications',
		researching: 'Researching domain',
		generating: 'Generating pack',
		done: 'Ready to refine',
		refining: 'Refining pack',
		error: 'Error',
	}[state.status]

	return {
		state: state.status,
		packFiles: state.packFiles,
		questions: state.questions,
		refineHistory: state.refineHistory,
		error: state.error,
		currentPhaseLabel,
		submit,
		answerQuestions,
		refine,
		reset,
	}
}
