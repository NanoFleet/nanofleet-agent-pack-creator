import { useState } from 'react'

type Props = {
	questions: string[]
	onSubmit: (answers: string[]) => void
	disabled: boolean
}

export function ClarificationStep({ questions, onSubmit, disabled }: Props) {
	const [answers, setAnswers] = useState<string[]>(questions.map(() => ''))

	const allAnswered = answers.every((a) => a.trim().length > 0)

	const updateAnswer = (i: number, value: string) => {
		setAnswers((prev) => prev.map((a, idx) => (idx === i ? value : a)))
	}

	return (
		<div style={{ marginBottom: '32px' }}>
			<h2
				style={{
					fontFamily: 'var(--font-sans)',
					fontSize: '16px',
					fontWeight: 500,
					color: 'var(--fg)',
					marginBottom: '20px',
				}}
			>
				A few questions before we proceed
			</h2>

			{questions.map((question, i) => (
				<div key={question} style={{ marginBottom: '16px' }}>
					<label
						htmlFor={`question-${i}`}
						style={{
							display: 'block',
							fontFamily: 'var(--font-sans)',
							fontSize: '14px',
							color: 'var(--fg)',
							marginBottom: '6px',
						}}
					>
						{question}
					</label>
					<textarea
						id={`question-${i}`}
						value={answers[i]}
						onChange={(e) => updateAnswer(i, e.target.value)}
						rows={2}
						style={{
							width: '100%',
							padding: '10px 12px',
							border: '1px solid var(--border)',
							borderRadius: '8px',
							backgroundColor: 'var(--bg)',
							color: 'var(--fg)',
							fontFamily: 'var(--font-mono)',
							fontSize: '13px',
							resize: 'vertical',
							outline: 'none',
							boxSizing: 'border-box',
						}}
					/>
				</div>
			))}

			<button
				type="button"
				onClick={() => onSubmit(answers)}
				disabled={disabled || !allAnswered}
				style={{
					padding: '12px 24px',
					backgroundColor:
						disabled || !allAnswered ? 'var(--border)' : 'var(--fg)',
					color: '#fff',
					border: 'none',
					borderRadius: '8px',
					fontFamily: 'var(--font-sans)',
					fontSize: '14px',
					fontWeight: 500,
					cursor: disabled || !allAnswered ? 'not-allowed' : 'pointer',
					transition: 'background-color 0.15s',
				}}
			>
				Continue →
			</button>
		</div>
	)
}
