import type { AttachedFile } from '@/lib/types'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const MAX_FILES = 3
const ALLOWED_TYPES = [
	'text/plain',
	'text/markdown',
	'application/json',
	'application/pdf',
	'image/png',
	'image/jpeg',
	'image/gif',
	'image/webp',
]

export function validateFiles(files: File[]): string | null {
	if (files.length > MAX_FILES) return `Maximum ${MAX_FILES} files allowed`
	for (const file of files) {
		if (file.size > MAX_FILE_SIZE) return `${file.name} exceeds 5 MB limit`
		if (!ALLOWED_TYPES.includes(file.type))
			return `${file.name}: unsupported file type`
	}
	return null
}

export async function readFileAsText(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(reader.result as string)
		reader.onerror = reject
		reader.readAsText(file)
	})
}

export async function readFileAsBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => {
			const result = reader.result as string
			resolve(result.split(',')[1]) // strip data URL prefix
		}
		reader.onerror = reject
		reader.readAsDataURL(file)
	})
}

export async function encodeAttachment(file: File): Promise<AttachedFile> {
	const isText = ['text/plain', 'text/markdown', 'application/json'].includes(
		file.type,
	)

	if (isText) {
		const content = await readFileAsText(file)
		return {
			name: file.name,
			size: file.size,
			mimeType: file.type,
			encoding: 'text',
			content,
		}
	}

	const content = await readFileAsBase64(file)
	return {
		name: file.name,
		size: file.size,
		mimeType: file.type,
		encoding: 'base64',
		content,
	}
}

export function buildAttachmentsContext(files: AttachedFile[]): string {
	if (files.length === 0) return ''
	return files
		.map((f) => {
			if (f.encoding === 'text') {
				return `\n\n--- Attached file: ${f.name} ---\n${f.content}\n--- End of ${f.name} ---`
			}
			return `\n\n[Attached file: ${f.name} (${f.mimeType}, base64 encoded — passed to API separately)]`
		})
		.join('')
}
