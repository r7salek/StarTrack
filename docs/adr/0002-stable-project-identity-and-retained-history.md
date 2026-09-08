# Stable project identity and retained history

Approved in the Phase 4 planning conversation on 2026-09-08. A project receives a
permanent UUID, separate from its name and numeric version-row IDs. Every save,
including status changes, appends a snapshot; stale concurrent saves are refused.
Archive projects instead of erasing history. Deactivate accounts while retaining
account-ID attribution and historical email snapshots.

Existing submissions require an explicitly reviewed complete mapping, including
version order and source fingerprint. Never merge solely by name or invent
unknown authorship. Keep V1 immutable and implement expansion and finalization
as later migrations. The normal developer database is excluded from automatic
adoption. Account attribution does not introduce a project-ownership permission
model; that remains a separate decision.

Runtime modernization must first pass on V1. Data changes and minimal frontend
wiring follow in separate checkpoints. This prevents framework and data-model
failures from becoming indistinguishable. The existing Angular versions, layout
and styling remain unchanged in this phase.
