import { useState } from 'react'
import type { PackFiles } from '@/lib/types'
import { buildZip, downloadZip } from '@/lib/zip'

type Props = {
	pack: PackFiles
	model: string
}

export function DownloadButton({ pack, model }: Props) {
	const [loading, setLoading] = useState(false)

	const handleDownload = async () => {
		setLoading(true)
		try {
			const blob = await buildZip(pack, model)
			downloadZip(blob, pack.agentName)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div
			style={{
				borderTop: '1px solid var(--border)',
				paddingTop: '24px',
				marginTop: '24px',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				flexWrap: 'wrap',
				gap: '12px',
			}}
		>
			<span
				style={{
					fontFamily: 'var(--font-mono)',
					fontSize: '13px',
					color: 'var(--muted)',
				}}
			>
				{pack.agentName}-pack.zip
			</span>

			<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
				<a
					href="https://nanofleet.ovh/docs/agents/packs/"
					target="_blank"
					rel="noopener noreferrer"
					style={{
						fontFamily: 'var(--font-mono)',
						fontSize: '12px',
						color: 'var(--muted)',
						textDecoration: 'none',
					}}
					onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--fg)')}
					onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
				>
					How to deploy →
				</a>

				<button
					type="button"
					onClick={handleDownload}
					disabled={loading}
					style={{
						padding: '10px 20px',
						backgroundColor: loading ? 'var(--border)' : 'var(--fg)',
						color: '#fff',
						border: 'none',
						borderRadius: '8px',
						fontFamily: 'var(--font-sans)',
						fontSize: '14px',
						fontWeight: 500,
						cursor: loading ? 'not-allowed' : 'pointer',
						transition: 'background-color 0.15s',
					}}
				>
					{loading ? 'Preparing...' : 'Download .zip'}
				</button>
			</div>
		</div>
	)
}
