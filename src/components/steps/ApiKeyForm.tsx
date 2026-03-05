import { useState } from 'react'
import { validateApiKey } from '@/lib/llm'
import type { AnthropicModel } from '@/lib/types'

type Props = {
	model: AnthropicModel
	apiKey: string
	onModelChange: (m: AnthropicModel) => void
	onApiKeyChange: (k: string) => void
}

const MODEL_LABELS: Record<AnthropicModel, string> = {
	'claude-opus-4-6': 'Opus',
	'claude-sonnet-4-6': 'Sonnet',
	'claude-haiku-4-5': 'Haiku',
}

const MODELS: AnthropicModel[] = [
	'claude-opus-4-6',
	'claude-sonnet-4-6',
	'claude-haiku-4-5',
]

export function ApiKeyForm({
	model,
	apiKey,
	onModelChange,
	onApiKeyChange,
}: Props) {
	const [show, setShow] = useState(false)
	const isValid = apiKey.length > 10 && validateApiKey(apiKey)

	return (
		<div style={{ marginBottom: '24px' }}>
			<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
				{/* Model pills */}
				<div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
					{MODELS.map((m) => (
						<button
							type="button"
							key={m}
							onClick={() => onModelChange(m)}
							style={{
								padding: '8px 16px',
								borderRadius: '999px',
								border: '1px solid var(--border)',
								backgroundColor: model === m ? 'var(--fg)' : 'transparent',
								color: model === m ? '#fff' : 'var(--fg)',
								fontFamily: 'var(--font-sans)',
								fontSize: '14px',
								fontWeight: 500,
								cursor: 'pointer',
								transition: 'all 0.15s',
								outline: 'none',
							}}
						>
							{MODEL_LABELS[m]}
						</button>
					))}
				</div>

				{/* API key input */}
				<div style={{ position: 'relative', flex: 1 }}>
					<input
						type={show ? 'text' : 'password'}
						value={apiKey}
						onChange={(e) => onApiKeyChange(e.target.value)}
						placeholder="Anthropic API key"
						style={{
							width: '100%',
							padding: '8px 80px 8px 12px',
							border: '1px solid var(--border)',
							borderRadius: '8px',
							backgroundColor: 'var(--bg)',
							color: 'var(--fg)',
							fontFamily: 'var(--font-mono)',
							fontSize: '13px',
							outline: 'none',
							boxSizing: 'border-box',
						}}
					/>
					<div
						style={{
							position: 'absolute',
							right: '12px',
							top: '50%',
							transform: 'translateY(-50%)',
							display: 'flex',
							alignItems: 'center',
							gap: '8px',
						}}
					>
						{isValid && (
							<span
								style={{
									color: '#5a9e6f',
									fontSize: '13px',
									fontFamily: 'var(--font-mono)',
								}}
							>
								✓
							</span>
						)}
						<button
							type="button"
							onClick={() => setShow(!show)}
							style={{
								background: 'none',
								border: 'none',
								cursor: 'pointer',
								padding: 0,
								display: 'flex',
								alignItems: 'center',
								color: 'var(--muted)',
							}}
							aria-label={show ? 'Hide API key' : 'Show API key'}
						>
							{show ? (
								<svg
									aria-hidden="true"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
									<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
									<line x1="1" y1="1" x2="23" y2="23" />
								</svg>
							) : (
								<svg
									aria-hidden="true"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
									<circle cx="12" cy="12" r="3" />
								</svg>
							)}
						</button>
					</div>
				</div>
			</div>

			<p
				style={{
					marginTop: '8px',
					fontFamily: 'var(--font-mono)',
					fontSize: '11px',
					color: 'var(--muted)',
				}}
			>
				Your key is never stored — memory only
			</p>
		</div>
	)
}
