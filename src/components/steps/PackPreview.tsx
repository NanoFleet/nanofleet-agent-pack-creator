import { useState } from 'react'
import type { PackFiles } from '@/lib/types'

type FileEntry = {
	key: string
	label: string
	content: string
	isGenerated: boolean
	skillType?: string
	isModified?: boolean
}

function buildFileTree(pack: PackFiles, modifiedFiles?: string[]): FileEntry[] {
	const modified = new Set(modifiedFiles ?? [])

	const entries: FileEntry[] = [
		{
			key: 'manifest',
			label: 'manifest.json',
			content: JSON.stringify(
				{ name: pack.agentName, version: '1.0.0', model: 'claude-sonnet-4-6' },
				null,
				2,
			),
			isGenerated: true,
			isModified: modified.has('manifest'),
		},
		{
			key: 'soul',
			label: 'SOUL.md',
			content: pack.soul,
			isGenerated: true,
			isModified: modified.has('soul'),
		},
		{
			key: 'style',
			label: 'STYLE.md',
			content: pack.style,
			isGenerated: true,
			isModified: modified.has('style'),
		},
	]

	if (pack.heartbeat) {
		entries.push({
			key: 'heartbeat',
			label: 'HEARTBEAT.md',
			content: pack.heartbeat,
			isGenerated: true,
			isModified: modified.has('heartbeat'),
		})
	}

	entries.push({
		key: 'agents',
		label: 'AGENTS.md',
		content: '# AGENTS.md\n\nPlaceholder — add agent references here.',
		isGenerated: false,
	})
	entries.push({
		key: 'memory',
		label: 'MEMORY.md',
		content: '# MEMORY.md\n\nPlaceholder — add persistent memory entries here.',
		isGenerated: false,
	})

	for (const skill of pack.skills) {
		entries.push({
			key: `skill:${skill.name}`,
			label: `skills/${skill.name}/SKILL.md`,
			content: skill.content,
			isGenerated: true,
			skillType: skill.type,
			isModified: modified.has(skill.name),
		})
	}

	return entries
}

const SKILL_TYPE_COLORS: Record<string, string> = {
	'capability-uplift': '#4a7c5e',
	'encoded-preference': '#6b5b8a',
}

type Props = {
	pack: PackFiles
	modifiedFiles?: string[]
}

export function PackPreview({ pack, modifiedFiles }: Props) {
	const entries = buildFileTree(pack, modifiedFiles)
	const [selectedKey, setSelectedKey] = useState(entries[0]?.key ?? '')

	const selected = entries.find((e) => e.key === selectedKey)

	return (
		<div
			style={{
				display: 'flex',
				border: '1px solid var(--border)',
				borderRadius: '8px',
				overflow: 'hidden',
				marginBottom: '32px',
				minHeight: '400px',
			}}
		>
			{/* File tree */}
			<div
				style={{
					width: '32%',
					borderRight: '1px solid var(--border)',
					padding: '12px 0',
					flexShrink: 0,
					overflowY: 'auto',
				}}
			>
				{entries.map((entry) => (
					<button
						type="button"
						key={entry.key}
						onClick={() => setSelectedKey(entry.key)}
						style={{
							display: 'block',
							width: '100%',
							textAlign: 'left',
							padding: '7px 12px',
							backgroundColor:
								selectedKey === entry.key
									? 'var(--selected-bg)'
									: 'transparent',
							border: 'none',
							cursor: 'pointer',
							outline: 'none',
						}}
					>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '6px',
								flexWrap: 'wrap',
							}}
						>
							{entry.isModified && (
								<span
									style={{
										width: '6px',
										height: '6px',
										borderRadius: '50%',
										backgroundColor: '#c0871a',
										flexShrink: 0,
									}}
								/>
							)}
							<span
								style={{
									fontFamily: 'var(--font-mono)',
									fontSize: '11px',
									color: 'var(--fg)',
									wordBreak: 'break-all',
								}}
							>
								{entry.label}
							</span>
						</div>
						<div
							style={{
								display: 'flex',
								gap: '4px',
								marginTop: '3px',
								flexWrap: 'wrap',
							}}
						>
							<span
								style={{
									fontSize: '9px',
									fontFamily: 'var(--font-mono)',
									padding: '1px 5px',
									borderRadius: '3px',
									border: `1px solid ${entry.isGenerated ? 'var(--fg)' : 'var(--muted)'}`,
									color: entry.isGenerated ? 'var(--fg)' : 'var(--muted)',
								}}
							>
								{entry.isGenerated ? 'generated' : 'placeholder'}
							</span>
							{entry.skillType && (
								<span
									style={{
										fontSize: '9px',
										fontFamily: 'var(--font-mono)',
										padding: '1px 5px',
										borderRadius: '3px',
										border: `1px solid ${SKILL_TYPE_COLORS[entry.skillType]}`,
										color: SKILL_TYPE_COLORS[entry.skillType],
									}}
								>
									{entry.skillType}
								</span>
							)}
						</div>
					</button>
				))}
			</div>

			{/* Content panel */}
			<div
				style={{
					flex: 1,
					backgroundColor: 'var(--preview-bg)',
					padding: '16px',
					overflowY: 'auto',
				}}
			>
				<pre
					style={{
						fontFamily: 'var(--font-mono)',
						fontSize: '12px',
						color: 'var(--fg)',
						whiteSpace: 'pre-wrap',
						wordBreak: 'break-word',
						margin: 0,
						lineHeight: 1.6,
					}}
				>
					{selected?.content ?? ''}
				</pre>
			</div>
		</div>
	)
}
