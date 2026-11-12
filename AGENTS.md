# Project instructions

When the user asks to run or start this DeVine project (for example, `yarn dev`), use this project directory:
`C:\Users\user\OneDrive\바탕 화면\devine`

Do not assume the current chat working directory is the project directory. Run project commands from the path above.

## Read only what the task needs

- Start with the relevant entry in [architecture](docs/architecture.md), then inspect that file and its direct dependencies. Expand to shared consumers when necessary; do not repeat whole-project audits for local changes.
- For UI work, consult [component guide](docs/component-guide.md) and reuse existing components/tokens.
- Follow [development guide](docs/development-guide.md) for file placement, naming, and verification commands.
- Documentation is a navigation aid, not proof of behavior. Verify actual source; update the relevant guide when routes, ownership, or commands change.
- Default new filenames to kebab-case; keep page-only logic beside its page. Preserve existing UI, animations, and API/mock paths unless explicitly asked to change them.
- Do not commit or push unless explicitly requested for the current work.

## Current design and data migration

Before changing mock data, API connections, or removing older pages, read `docs/design-data-migration.md`. Preserve the current mock-backed design and retain existing API and legacy code until functional parity is verified.

## Badge consistency

When adding or updating badges, reuse the existing shared badge components and established styling. Use `src/shared/components/common/TechStackChip.tsx` for technology stack chips, including read-only displays; avoid creating competing badge designs unless explicitly requested.

## Commit scope

When committing changes, include only files needed for the user's requested project work. Review the staged file list before committing. Exclude unrelated files and generated artifacts such as browser screenshots, snapshots, diagnostic logs, temporary outputs, and model backups unless the user explicitly asks to commit them.
