import type { PipelineState } from '@/lib/types'

const STEPS: { id: PipelineState[]; label: string }[] = [
	{ id: ['intake'], label: 'Analyzing request' },
	{ id: ['researching'], label: 'Researching domain' },
	{ id: ['generating'], label: 'Generating pack' },
	{ id: ['done', 'refining'], label: 'Ready to refine' },
]

function getStepStatus(stepIds: PipelineState[], currentState: PipelineState) {
	if (currentState === 'done' && stepIds.includes('done')) return 'done'
	const stateOrder: PipelineState[] = [
		'idle',
		'intake',
		'clarifying',
		'researching',
		'generating',
		'done',
		'refining',
		'error',
	]
	const currentIndex = stateOrder.indexOf(currentState)
	const stepMaxIndex = Math.max(...stepIds.map((id) => stateOrder.indexOf(id)))
	const stepMinIndex = Math.min(...stepIds.map((id) => stateOrder.indexOf(id)))

	if (currentIndex > stepMaxIndex) return 'done'
	if (currentIndex >= stepMinIndex && currentIndex <= stepMaxIndex)
		return 'active'
	return 'pending'
}

type Props = {
	state: PipelineState
}

export function ProgressTracker({ state }: Props) {
	return (
		<div style={{ marginBottom: '32px' }}>
			{STEPS.map((step) => {
				const status = getStepStatus(step.id, state)
				return (
					<div
						key={step.label}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '12px',
							padding: '8px 0',
						}}
					>
						{/* Icon */}
						<div
							style={{
								width: '20px',
								flexShrink: 0,
								display: 'flex',
								justifyContent: 'center',
							}}
						>
							{status === 'done' && (
								<svg
									aria-hidden="true"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="#5a9e6f"
									strokeWidth="2.5"
								>
									<polyline points="20 6 9 17 4 12" />
								</svg>
							)}
							{status === 'active' && (
								<div
									style={{
										width: '14px',
										height: '14px',
										borderRadius: '50%',
										border: '2px solid var(--fg)',
										borderTopColor: 'transparent',
										animation: 'spin 0.8s linear infinite',
									}}
								/>
							)}
							{status === 'pending' && (
								<div
									style={{
										width: '14px',
										height: '14px',
										borderRadius: '50%',
										border: '1.5px solid var(--border)',
									}}
								/>
							)}
						</div>

						{/* Label */}
						<span
							style={{
								fontFamily: 'var(--font-sans)',
								fontSize: '14px',
								fontWeight: status === 'active' ? 600 : 400,
								color:
									status === 'pending'
										? 'var(--muted)'
										: status === 'done'
											? 'var(--muted)'
											: 'var(--fg)',
							}}
						>
							{step.label}
						</span>
					</div>
				)
			})}
			<style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
		</div>
	)
}
