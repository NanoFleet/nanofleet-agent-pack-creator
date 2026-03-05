import { type DragEvent, useRef, useState } from 'react'
import { encodeAttachment, validateFiles } from '@/lib/files'
import type { AttachedFile } from '@/lib/types'

type Props = {
	onSubmit: (request: string, files: AttachedFile[]) => void
	disabled: boolean
}

export function RequestForm({ onSubmit, disabled }: Props) {
	const [request, setRequest] = useState('')
	const [files, setFiles] = useState<File[]>([])
	const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
	const [fileError, setFileError] = useState<string | null>(null)
	const [isDragging, setIsDragging] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFilesAdded = async (newFiles: File[]) => {
		const all = [...files, ...newFiles]
		const error = validateFiles(all)
		if (error) {
			setFileError(error)
			return
		}
		setFileError(null)
		setFiles(all)
		const encoded = await Promise.all(newFiles.map(encodeAttachment))
		setAttachedFiles((prev) => [...prev, ...encoded])
	}

	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index))
		setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
		setFileError(null)
	}

	const handleDrop = (e: DragEvent<HTMLElement>) => {
		e.preventDefault()
		setIsDragging(false)
		const dropped = Array.from(e.dataTransfer.files)
		handleFilesAdded(dropped)
	}

	const handleSubmit = () => {
		if (!request.trim() || disabled) return
		onSubmit(request.trim(), attachedFiles)
	}

	const formatSize = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
		return `${(bytes / 1024 / 1024).toFixed(1)} MB`
	}

	return (
		<div>
			{/* Textarea */}
			<textarea
				value={request}
				onChange={(e) => setRequest(e.target.value)}
				placeholder="I want an agent pack for a web security researcher..."
				rows={5}
				style={{
					width: '100%',
					padding: '14px',
					border: '1px solid var(--border)',
					borderRadius: '8px',
					backgroundColor: 'var(--bg)',
					color: 'var(--fg)',
					fontFamily: 'var(--font-mono)',
					fontSize: '13px',
					resize: 'vertical',
					outline: 'none',
					boxSizing: 'border-box',
					lineHeight: 1.6,
				}}
				onKeyDown={(e) => {
					if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
				}}
			/>

			{/* Drop zone */}
			<label
				htmlFor="file-upload"
				onDragOver={(e) => {
					e.preventDefault()
					setIsDragging(true)
				}}
				onDragLeave={() => setIsDragging(false)}
				onDrop={handleDrop}
				style={{
					marginTop: '8px',
					padding: '16px',
					border: `1px dashed ${isDragging ? 'var(--fg)' : 'var(--border)'}`,
					borderRadius: '8px',
					cursor: 'pointer',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: '8px',
					backgroundColor: isDragging ? 'var(--selected-bg)' : 'transparent',
					transition: 'all 0.15s',
				}}
			>
				<svg
					aria-hidden="true"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="var(--muted)"
					strokeWidth="2"
				>
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="17 8 12 3 7 8" />
					<line x1="12" y1="3" x2="12" y2="15" />
				</svg>
				<span
					style={{
						fontFamily: 'var(--font-mono)',
						fontSize: '12px',
						color: 'var(--muted)',
					}}
				>
					Attach files (optional)
				</span>
				<input
					id="file-upload"
					ref={fileInputRef}
					type="file"
					multiple
					accept=".txt,.md,.json,.pdf,.png,.jpg,.jpeg,.gif,.webp"
					style={{ display: 'none' }}
					onChange={(e) => {
						if (e.target.files) handleFilesAdded(Array.from(e.target.files))
					}}
				/>
			</label>

			{/* File error */}
			{fileError && (
				<p
					style={{
						marginTop: '6px',
						fontFamily: 'var(--font-mono)',
						fontSize: '11px',
						color: '#c0392b',
					}}
				>
					{fileError}
				</p>
			)}

			{/* File chips */}
			{files.length > 0 && (
				<div
					style={{
						display: 'flex',
						flexWrap: 'wrap',
						gap: '6px',
						marginTop: '8px',
					}}
				>
					{files.map((file, i) => (
						<div
							key={`${file.name}-${file.size}`}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '6px',
								padding: '4px 10px',
								border: '1px solid var(--border)',
								borderRadius: '999px',
								fontFamily: 'var(--font-mono)',
								fontSize: '11px',
								color: 'var(--fg)',
							}}
						>
							<span>{file.name}</span>
							<span style={{ color: 'var(--muted)' }}>
								{formatSize(file.size)}
							</span>
							<button
								type="button"
								onClick={() => removeFile(i)}
								style={{
									background: 'none',
									border: 'none',
									cursor: 'pointer',
									padding: 0,
									color: 'var(--muted)',
									lineHeight: 1,
									fontSize: '14px',
								}}
							>
								×
							</button>
						</div>
					))}
				</div>
			)}

			{/* CTA Button */}
			<button
				type="button"
				onClick={handleSubmit}
				disabled={disabled || !request.trim()}
				style={{
					marginTop: '16px',
					width: '100%',
					padding: '14px',
					backgroundColor:
						disabled || !request.trim() ? 'var(--border)' : 'var(--fg)',
					color: '#fff',
					border: 'none',
					borderRadius: '8px',
					fontFamily: 'var(--font-sans)',
					fontSize: '15px',
					fontWeight: 500,
					cursor: disabled || !request.trim() ? 'not-allowed' : 'pointer',
					transition: 'background-color 0.15s',
				}}
			>
				Generate Agent Pack →
			</button>
		</div>
	)
}
