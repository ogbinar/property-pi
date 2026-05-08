# Implementation Plan (Archived)

This document is historical. The active work now lives in:

- [REARCHITECTURE-PLAN.md](./REARCHITECTURE-PLAN.md)
- [README.md](./README.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)

The old checklist below referred to earlier architecture and security work that has since been superseded by the single-service FastAPI runtime.

## What Changed

- The production runtime now builds from the repo root and serves the SPA and API from one FastAPI container.
- The old split frontend/backend production model is no longer the target.
- The current cleanup focus is documentation alignment and keeping the runtime contract canonical.

## Historical Notes

- Some items in the original plan reference earlier architecture pivots and the old Docker composition.
- Those references are preserved only for context and should not be used as current implementation guidance.
