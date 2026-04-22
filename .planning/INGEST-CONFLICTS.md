## Conflict Detection Report

### BLOCKERS (0)

No blockers detected.

---

### WARNINGS (0)

No competing variants detected.

---

### INFO (14)

[INFO] ADR supersedes archived plans
  Note: ARCHITECTURE-DECISION.md (locked, precedence=1) explicitly supersedes 14 archived plans in plans/archive/*.md — all used Prisma + PostgreSQL + NextAuth stack which is now obsolete
  → Auto-resolved: ADR wins, archived plans marked superseded

[INFO] ADR supersedes Phase 2 plan
  Note: ARCHITECTURE-DECISION.md (locked, precedence=1) supersedes `.planning/phases/02/02-PLAN.md` which used FastAPI token auth approach
  → Auto-resolved: ADR wins, FastAPI token auth replaced with PocketBase auth

[INFO] ADR corrects research document
  Note: ARCHITECTURE-DECISION.md (locked) corrects `.planning/research/STACK.md` which suggested removing FastAPI entirely — FastAPI stays for reporting/automation
  → Auto-resolved: ADR wins, FastAPI retained for aggregation/automation

[INFO] SPEC tech stack superseded
  Note: SPEC.md proposed Next.js + PostgreSQL/Prisma + NextAuth — now superseded by ARCHITECTURE-DECISION.md (PocketBase + FastAPI hybrid)
  → Auto-resolved: ADR wins, SPEC tech stack updated

[INFO] PLAN-PHASE-1 superseded
  Note: PLAN-PHASE-1.md (precedence=5) assumes Prisma/PostgreSQL/NextAuth stack — superseded by ARCHITECTURE-DECISION.md
  → Auto-resolved: ADR wins, entire data layer and auth approach changed

[INFO] Task summaries document Prisma implementation
  Note: TASK-1.2-SUMMARY.md, TASK-1.3-SUMMARY.md, TASK-1.6-SUMMARY.md document completed tasks that used Prisma — now superseded by PocketBase
  → Auto-resolved: Implementation data layer must be swapped to PocketBase, UI components remain valid

[INFO] Existing .planning/PROJECT.md matches incoming ADR
  Note: Existing .planning/PROJECT.md already reflects PocketBase + FastAPI hybrid architecture — no conflict with incoming ARCHITECTURE-DECISION.md
  → No action needed: architecture already aligned

[INFO] Existing .planning/ROADMAP.md phases align with ADR
  Note: Existing ROADMAP.md has phases 1-5 defined that match the ADR's migration path (cleanup → auth → data layer → tenant portal → deploy)
  → No action needed: phase structure already aligned

[INFO] Existing .planning/REQUIREMENTS.md aligns with ADR
  Note: Existing REQUIREMENTS.md (REQ-01 through REQ-15) defines requirements that are compatible with the PocketBase + FastAPI architecture
  → No action needed: requirements already aligned

[INFO] LOCKED ADR consistent with existing locked decisions
  Note: ARCHITECTURE-DECISION.md is locked; existing .planning/PROJECT.md and ROADMAP.md reflect the same architecture — no LOCKED-vs-LOCKED contradiction
  → No action needed: locked decisions are consistent

[INFO] No PRD requirement conflicts detected
  Note: No formal PRD documents in ingest set; requirements extracted from SPEC.md align with existing REQUIREMENTS.md
  → No action needed: requirements consistent

[INFO] No SPEC contradictions with ADR
  Note: SPEC.md constraints align with ARCHITECTURE-DECISION.md after tech stack update (Prisma → PocketBase)
  → Auto-resolved: SPEC updated to reflect ADR

[INFO] Cycle detection passed
  Note: Cross-reference graph built from 20 classifications; no cycles detected at traversal depth ≤50
  → No action needed: synthesis safe to proceed

[INFO] All classifications have high confidence
  Note: 20 documents classified — 17 with high confidence, 1 (plans-archive/PLAN.md) with medium confidence; no low-confidence UNKNOWN docs
  → No action needed: all documents valid for synthesis

---

*Generated: 2026-04-21 via /gsd-ingest-docs (MERGE mode)*  
*Total auto-resolved: 14*
