## Conflict Detection Report

### BLOCKERS (1)

[BLOCKER] Cross-ref cycle in superseded plans archive
  Found: plans/archive/02-unit-management.md ↔ TASK-1.2-SUMMARY.md form a bidirectional cross-ref cycle; PLAN-PHASE-1.md also participates in cycles with multiple sub-plans and task summaries (02, 03, 05, 06, 07, 04)
  Impact: Synthesis of the cyclic set would loop indefinitely — garbage output possible
  → These docs are all marked superseded by ARCHITECTURE-DECISION.md. They are included in intel for provenance but excluded from synthesis loops. No action needed beyond noting this.

### WARNINGS (0)

No competing acceptance variants detected. No new PRDs introduced in this ingest cycle.

### INFO (8)

[INFO] Auto-resolved: All archive plans superseded by ARCHITECTURE-DECISION.md
  Note: 14 PLAN documents and 1 SPEC document explicitly list ARCHITECTURE-DECISION.md as their superseded_by — entire Prisma/PostgreSQL/NextAuth stack is obsolete. Synthesis carries forward only the PocketBase+FastAPI requirements.

[INFO] Auto-resolved: TASK summaries reference obsolete Prisma implementation
  Note: TASK-1.2-SUMMARY.md, TASK-1.3-SUMMARY.md, TASK-1.6-SUMMARY.md document completed work using Prisma API routes — these must be replaced with PocketBase SDK calls per REQ-06. The task summaries serve as historical context only.

[INFO] Auto-resolved: SPEC.md tech stack superseded by ADR
  Note: SPEC.md declared "Next.js, PostgreSQL/Prisma, NextAuth.js" (now obsolete). ADR D-01 through D-10 establish PocketBase + FastAPI. Requirements REQ-01 through REQ-15 already reflect the new stack and remain valid.

[INFO] Auto-resolved: Deployment docs add platform context, no requirement conflicts
  Note: DEPLOYMENT.md (Railway/Vercel) and DEPLOYMENT-DOCKPLOY.md (Dokploy) cover different platforms for the same app. No conflicting acceptance criteria — both are deployment options.

[INFO] Auto-resolved: Locked ADR wins over all non-locked sources
  Note: ARCHITECTURE-DECISION.md is the only locked decision. All other docs (plans, specs, task summaries) that contradict it on stack/tech are auto-resolved in favor of the ADR.

[INFO] Auto-resolved: PLAN-PHASE-1 superseded by ADR
  Note: PLAN-PHASE-1.md declares Prisma/PostgreSQL/NextAuth stack (precedence 5). ARCHITECTURE-DECISION.md (precedence 1, locked) supersedes it entirely. Phase structure (Phases 1–5) from ROADMAP.md remains valid per D-09.

[INFO] New DOCs added: 9 deployment-related documents
  Note: DEPLOYMENT.md, DEPLOYMENT-DOCKPLOY.md, docker-compose.yml, docker-compose.dokploy.yml, dokploy-config.md, dokploy-deployment-checklist.md, dokploy-deployment-template.md, dokploy-prop-deployment.md, github-push-workflow.md — all classified as DOC type, non-locked, added to context.md topic "Deployment Guides (New)"

[INFO] Cycle detection: 13 cycles found, all within superseded plan set
  Note: All cycles involve PLAN-PHASE-1.md ↔ sub-plan archives ↔ task summaries. Since these are all superseded by the locked ADR, they produce no actionable conflicts beyond provenance tracking.
