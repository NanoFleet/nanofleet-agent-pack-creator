# Security Policy

## API key handling

Your Anthropic API key is:

- **never stored** — it lives only in React state for the duration of the session and is gone on page refresh
- **never logged** — the proxy strips it from logs entirely
- forwarded as-is to `https://api.anthropic.com/v1` — no intermediary reads or retains it

All API calls transit through a local nginx reverse proxy bundled in the Docker image. This proxy exists solely to strip browser-identifying headers (`Origin`, `Referer`) that would otherwise cause Anthropic to reject the request. The key is passed through unchanged and never touches any external NanoFleet infrastructure.

In development (`npm run dev`), the same proxy role is fulfilled by the Vite dev server on localhost.

## Reporting a vulnerability

If you discover a security vulnerability in this project, please **do not open a public GitHub issue**.

Use [GitHub private security advisories](../../security/advisories/new) to report it confidentially.

Include:
- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof of concept
- Any relevant environment details (browser, OS, version)
