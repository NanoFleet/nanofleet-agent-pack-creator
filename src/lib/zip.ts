import JSZip from 'jszip'
import type { PackFiles } from '@/lib/types'

const AGENTS_MD_PLACEHOLDER = `# AGENTS.md

This file defines other agents this agent can collaborate with.

## Usage
Add agent references here when you want this agent to delegate tasks or work alongside other NanoFleet agents.

\`\`\`
# Example
- agent: code-reviewer
  role: Validates code changes before deployment
\`\`\`
`

const MEMORY_MD_PLACEHOLDER = `# MEMORY.md

This file defines persistent memory entries for this agent.

## Usage
Add memory entries that should persist across conversations.

\`\`\`
# Example
- key: preferred_language
  value: TypeScript
- key: project_context
  value: NanoFleet agent pack generator
\`\`\`
`

const HEARTBEAT_MD_PLACEHOLDER = `# HEARTBEAT.md

Add instructions here for what this agent should do each time the heartbeat triggers.
The schedule is controlled externally via the \`HEARTBEAT_INTERVAL\` environment variable.

## Example

Check the project board for newly opened issues and add a brief triage comment to each one.

Summarize any pull requests merged since the last heartbeat and post the summary to the team channel.

Update the status dashboard with the latest metrics from the monitoring API.
`

export async function buildZip(
	packFiles: PackFiles,
	model: string,
): Promise<Blob> {
	const zip = new JSZip()
	const root = zip.folder(packFiles.agentName)
	if (!root) throw new Error('Failed to create zip root folder')

	const manifest = {
		name: packFiles.agentName,
		version: '1.0.0',
		model,
		generated: new Date().toISOString(),
	}
	root.file('manifest.json', JSON.stringify(manifest, null, 2))
	root.file('SOUL.md', packFiles.soul)
	root.file('STYLE.md', packFiles.style)
	root.file('AGENTS.md', AGENTS_MD_PLACEHOLDER)
	root.file('MEMORY.md', MEMORY_MD_PLACEHOLDER)

	if (packFiles.heartbeat) {
		root.file('HEARTBEAT.md', packFiles.heartbeat)
	} else {
		root.file('HEARTBEAT.md', HEARTBEAT_MD_PLACEHOLDER)
	}

	const skillsFolder = root.folder('skills')
	if (!skillsFolder) throw new Error('Failed to create skills folder')
	for (const skill of packFiles.skills) {
		const skillFolder = skillsFolder.folder(skill.name)
		if (!skillFolder)
			throw new Error(`Failed to create folder for skill: ${skill.name}`)
		skillFolder.file('SKILL.md', skill.content)
	}

	return zip.generateAsync({ type: 'blob' })
}

export function downloadZip(blob: Blob, agentName: string): void {
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = `${agentName}-pack.zip`
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	URL.revokeObjectURL(url)
}
