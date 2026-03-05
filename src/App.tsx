import { useState } from 'react'
import { DownloadButton } from '@/components/DownloadButton'
import { Hero } from '@/components/layout/Hero'
import { Navbar } from '@/components/layout/Navbar'
import { ApiKeyForm } from '@/components/steps/ApiKeyForm'
import { ClarificationStep } from '@/components/steps/ClarificationStep'
import { PackPreview } from '@/components/steps/PackPreview'
import { ProgressTracker } from '@/components/steps/ProgressTracker'
import { RefineForm } from '@/components/steps/RefineForm'
import { RequestForm } from '@/components/steps/RequestForm'
import { usePipeline } from '@/hooks/usePipeline'
import type { AnthropicModel } from '@/lib/types'

export default function App() {
	const [model, setModel] = useState<AnthropicModel>('claude-sonnet-4-6')
	const [apiKey, setApiKey] = useState('')

	const {
		state,
		packFiles,
		questions,
		refineHistory,
		error,
		submit,
		answerQuestions,
		refine,
		reset,
	} = usePipeline({ model, apiKey })

	const isProcessing =
		state === 'intake' ||
		state === 'researching' ||
		state === 'generating' ||
		state === 'refining'
	const lastRefine = refineHistory[refineHistory.length - 1]

	return (
		<div
			style={{
				minHeight: '100vh',
				backgroundColor: 'var(--bg)',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<Navbar />

			<main
				style={{
					flex: 1,
					width: '100%',
					maxWidth: '900px',
					margin: '0 auto',
					padding: '56px 24px 80px',
				}}
			>
				<Hero />

				{/* Idle state — show form */}
				{state === 'idle' && (
					<>
						<ApiKeyForm
							model={model}
							apiKey={apiKey}
							onModelChange={setModel}
							onApiKeyChange={setApiKey}
						/>
						<RequestForm onSubmit={submit} disabled={!apiKey.trim()} />
					</>
				)}

				{/* Pipeline running or done */}
				{state !== 'idle' && state !== 'error' && (
					<>
						<ProgressTracker state={state} />

						{/* Clarification questions */}
						{state === 'clarifying' && questions && (
							<ClarificationStep
								questions={questions}
								onSubmit={answerQuestions}
								disabled={isProcessing}
							/>
						)}

						{/* Pack preview */}
						{(state === 'done' || state === 'refining') && packFiles && (
							<>
								<PackPreview
									pack={packFiles}
									modifiedFiles={lastRefine?.changedFiles}
								/>
								<RefineForm
									onRefine={refine}
									history={refineHistory}
									disabled={isProcessing}
								/>
								<DownloadButton pack={packFiles} model={model} />
							</>
						)}

						{/* Reset button */}
						{(state === 'done' || state === 'clarifying') && (
							<div style={{ marginTop: '32px', textAlign: 'center' }}>
								<button
									type="button"
									onClick={reset}
									style={{
										background: 'none',
										border: 'none',
										cursor: 'pointer',
										fontFamily: 'var(--font-mono)',
										fontSize: '12px',
										color: 'var(--muted)',
										textDecoration: 'underline',
									}}
								>
									Start over
								</button>
							</div>
						)}
					</>
				)}

				{/* Error state */}
				{state === 'error' && (
					<div style={{ textAlign: 'center', padding: '40px 0' }}>
						<p
							style={{
								fontFamily: 'var(--font-mono)',
								fontSize: '13px',
								color: '#c0392b',
								marginBottom: '20px',
							}}
						>
							{error}
						</p>
						<div
							style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}
						>
							<button
								type="button"
								onClick={reset}
								style={{
									padding: '10px 20px',
									backgroundColor: 'var(--fg)',
									color: '#fff',
									border: 'none',
									borderRadius: '8px',
									fontFamily: 'var(--font-sans)',
									fontSize: '14px',
									fontWeight: 500,
									cursor: 'pointer',
								}}
							>
								Start over
							</button>
						</div>
					</div>
				)}
			</main>
			<footer
				style={{
					textAlign: 'center',
					padding: '32px 24px',
					borderTop: '1px solid var(--border)',
				}}
			>
				<p
					style={{
						fontFamily: 'var(--font-mono)',
						fontSize: '11px',
						color: 'var(--muted)',
						margin: 0,
					}}
				>
					© 2026{' '}
					<a
						href="https://www.nanofleet.ovh"
						target="_blank"
						rel="noopener noreferrer"
						style={{ color: 'var(--muted)', textDecoration: 'underline' }}
					>
						NanoFleet
					</a>
				</p>
			</footer>
		</div>
	)
}
