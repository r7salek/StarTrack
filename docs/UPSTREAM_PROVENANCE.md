# Upstream provenance

## Verified sources

| Component | Public source | Pinned revision | Import destination |
| --- | --- | --- | --- |
| Backend | <https://github.com/SchubertLab/star-track> | `a67efded0eb9881425d7c15c9546906f0f755401` | `backend/` |
| Frontend | <https://github.com/SchubertLab/star-track-webfrontend> | `21e612f6daf5e23174d22d8fb69200f8bdd4d5f4` | `frontend/` |

Both public repositories contain a single one-time upload on 31 March 2025 by
the public account `zaheer004`. The local delivery in `StarTrack Tool 2` was
compared recursively with those revisions: the backend is an exact content
match, and the frontend is an exact content match after excluding its Git
metadata.

The hosted application describes itself as the OTR Project and Impact Tracker,
supported by the STAR-Track project within the Cambridge–LMU Strategic
Partnership in collaboration with CPC-M bioArchive Munich.

## Licence record

The frontend includes an MIT licence naming CPC-M bioArchive Munich (2024).
The backend Maven manifest declares the same MIT licence. `LICENSE` reproduces
the upstream licence text and `NOTICE` retains both source URLs and revisions.

## Deliberate import controls

This is a source-code baseline, not a data or infrastructure migration.

- No project, user, or database records were copied.
- No OAuth client credentials, database passwords, or historic token secret
  were retained. The backend now expects `STARTRACK_DB_PASSWORD` and
  `STARTRACK_TOKEN_SECRET` from its environment.
- Existing production and test URLs are not treated as deployment targets or
  proof of access.
- The upstream commits are immutable references for later code comparison.

Any future connection to real data, identity services, or external hosting
needs its own approved access, information-governance, and deployment plan.
