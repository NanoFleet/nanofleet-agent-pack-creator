import { useState } from 'react'
import type { RefineHistoryEntry } from '@/lib/types'

type Props = {
	onRefine: (instruction: string) => void
	history: RefineHistoryEntry[]
	disabled: boolean
}

export function RefineForm({ onRefine, history, disabled }: Props) {
	const [instruction, setInstruction] = useState('')

	const handleSubmit = () => {
		if (!instruction.trim() || disabled) return
		onRefine(instruction.trim())
		setInstruction('')
	}

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
	}

	return (
		<div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
			<div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
				<textarea
					value={instruction}
					onChange={(e) => setInstruction(e.target.value)}
					placeholder="Refine this pack..."
					rows={2}
					style={{
						flex: 1,
						padding: '10px 12px',
						border: '1px solid var(--border)',
						borderRadius: '8px',
						backgroundColor: 'var(--bg)',
						color: 'var(--fg)',
						fontFamily: 'var(--font-mono)',
						fontSize: '13px',
						resize: 'none',
						outline: 'none',
						boxSizing: 'border-box',
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
					}}
				/>
				<button
					type="button"
					onClick={handleSubmit}
					disabled={disabled || !instruction.trim()}
					style={{
						padding: '10px 16px',
						backgroundColor: 'transparent',
						color:
							disabled || !instruction.trim() ? 'var(--muted)' : 'var(--fg)',
						border: `1px solid ${disabled || !instruction.trim() ? 'var(--border)' : 'var(--fg)'}`,
						borderRadius: '8px',
						fontFamily: 'var(--font-sans)',
						fontSize: '14px',
						fontWeight: 500,
						cursor: disabled || !instruction.trim() ? 'not-allowed' : 'pointer',
						flexShrink: 0,
						transition: 'all 0.15s',
					}}
				>
					Refine →
				</button>
			</div>

			{history.length > 0 && (
				<div style={{ marginTop: '16px' }}>
					{history.map((entry) => (
						<div
							key={entry.timestamp.getTime()}
							style={{
								padding: '10px 0',
								borderTop: '1px solid var(--border)',
							}}
						>
							<div
								style={{
									display: 'flex',
									alignItems: 'baseline',
									gap: '8px',
									marginBottom: '4px',
								}}
							>
								<span
									style={{
										fontFamily: 'var(--font-mono)',
										fontSize: '11px',
										color: 'var(--muted)',
									}}
								>
									{formatTime(entry.timestamp)}
								</span>
								<span
									style={{
										fontFamily: 'var(--font-sans)',
										fontSize: '13px',
										color: 'var(--fg)',
									}}
								>
									{entry.instruction}
								</span>
							</div>
							<p
								style={{
									fontFamily: 'var(--font-mono)',
									fontSize: '11px',
									color: 'var(--muted)',
									margin: 0,
								}}
							>
								{entry.summary}
							</p>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
