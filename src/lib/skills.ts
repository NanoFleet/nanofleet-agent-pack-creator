const SKILL_CREATOR_URL =
	'https://raw.githubusercontent.com/anthropics/skills/refs/heads/main/skills/skill-creator/SKILL.md'

let skillCache: string | null = null

function parseSkillMd(raw: string): {
	name: string
	description: string
	body: string
} {
	const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)/)
	if (!match) throw new Error('Cannot parse SKILL.md frontmatter')

	const frontmatter = match[1]
	const body = match[2].trim()

	const name =
		frontmatter.match(/^name:\s*(.+)$/m)?.[1]?.trim() ?? 'skill-creator'
	const description =
		frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim() ?? ''

	return { name, description, body }
}

export async function fetchSkillCreatorBlock(): Promise<string> {
	if (skillCache) return skillCache

	const res = await fetch(SKILL_CREATOR_URL)
	if (!res.ok)
		throw new Error(
			`Failed to fetch skill-creator SKILL.md (HTTP ${res.status})`,
		)

	const raw = await res.text()
	const { name, description, body } = parseSkillMd(raw)

	skillCache = `<skill name="${name}" description="${description}">\n${body}\n</skill>`
	return skillCache
}
