# Project instructions

When the user asks to run or start this DeVine project (for example, `yarn dev`), use this project directory:
`C:\Users\user\OneDrive\바탕 화면\devine`

Do not assume the current chat working directory is the project directory. Run project commands from the path above.

## Current design and data migration

Before changing mock data, API connections, or removing older pages, read `docs/design-data-migration.md`. Preserve the current mock-backed design and retain existing API and legacy code until functional parity is verified.

## Badge consistency

When adding or updating badges, reuse the existing shared badge components and established styling. Use `src/shared/components/common/TechStackChip.tsx` for technology stack chips, including read-only displays; avoid creating competing badge designs unless explicitly requested.

## Commit scope

When committing changes, include only files needed for the user's requested project work. Review the staged file list before committing. Exclude unrelated files and generated artifacts such as browser screenshots, snapshots, diagnostic logs, temporary outputs, and model backups unless the user explicitly asks to commit them.
