export function Hero() {
	return (
		<div style={{ textAlign: 'center', padding: '80px 0 48px' }}>
			<h1
				style={{
					fontFamily: 'var(--font-serif)',
					fontSize: 'clamp(2.5rem, 6vw, 4rem)',
					whiteSpace: 'nowrap',
					fontWeight: 700,
					color: 'var(--fg)',
					lineHeight: 1.1,
					margin: '0 0 16px',
				}}
			>
				Agent Pack Generator
			</h1>
			<p
				style={{
					fontFamily: 'var(--font-mono)',
					fontSize: '14px',
					color: 'var(--muted)',
					margin: 0,
				}}
			>
				Describe your agent. Get a deployable NanoFleet pack.
			</p>
		</div>
	)
}
