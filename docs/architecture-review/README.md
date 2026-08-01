# Architecture & Product Review — wenxiantaekwondo.se

> Repository-grounded review, 2026-07-13, of `main` @ `45c9c91` (verified identical to production). No code was modified; these documents are the only additions. Nothing is committed — review, then commit deliberately.

## Reading order

| Doc | Contents | Read it if you are… |
|---|---|---|
| [01-current-state.md](01-current-state.md) | File-and-line evidence: 13 findings with severity | the maintainer (start here) |
| [02-design-principles.md](02-design-principles.md) | Principles as costs, not a scorecard; what's a real problem vs. a fine shortcut | the junior developer learning architecture |
| [03-business-workflow.md](03-business-workflow.md) | Today's manual funnel, where families are lost, and the 9-state applicant model (+ Mermaid diagram) | the instructor (§A.2 especially) |
| [04-solution-options.md](04-solution-options.md) | Four strategies compared; recommendation: **A2 now, platform at payments, no custom backend** | anyone deciding budget |
| [05-recommended-architecture.md](05-recommended-architecture.md) | Level-1 frontend split with step-by-step plan; Swedish payment architecture; target diagram | the senior reviewer + implementer |
| [06-gdpr-security.md](06-gdpr-security.md) | Children's data, urgent privacy fixes, secrets scan (clean), ⚖️ items for the board | the board / data controller |
| [07-roadmap.md](07-roadmap.md) | Phases 0–5 with scope, rollback, acceptance; metrics & dashboard design | the implementer |
| [08-decision-log.md](08-decision-log.md) | 8 blocking + 11 deferrable decisions, with the assumptions this review made | the board (one meeting) |

## The seven questions, answered

1. **What should change now?** (Phase 0–1) Remove the false "via Recess.tv" label; add `required` + stable option values + honeypot/captcha; consent checkbox + bilingual privacy page; drop birth month/day (year suffices); redirect to a bilingual thank-you page; mobile hamburger nav; delete 38.7 MB of unused videos and shrink images (~60 MB → <5 MB per visit); then the Level-1 file split. All low-risk, all revertible, ~3–4 evenings total.
2. **What should not change yet?** The single-page format, the hosting (GitHub Pages + Loopia), the `data-i18n` mechanism, the media modal, the native form POST, inline styles, and git history. No SSG, no framework, no backend, no database.
3. **The smallest useful automation?** Phase 2: form → one small Apps Script → Google Sheet (the applicant record) + instant bilingual acknowledgement. It closes the funnel's biggest leak (families who hear nothing) at 0 kr/month and is reversible with one attribute change.
4. **End-to-end target architecture?** Static site (unchanged) → intake script → Sheet implementing the 9-state model → time-based reminders → Swish Företag with per-applicant references → club-management platform for membership/invoicing when payment volume justifies it. Diagram in doc 05 §C.
5. **When does GitHub Pages stop sufficing?** Practically never for this site. It only fails when you need server-side secrets, webhooks, or logged-in pages — all of which live in Apps Script or the platform in this design, never on Pages.
6. **What should be third-party services, not custom code?** Payment processing and matching, membership register, invoicing/reminders, form spam protection, email delivery, and (if ever wanted) self-service booking. Custom code is limited to ~100 lines of intake/reminder glue — the one place gluing is cheaper than buying.
7. **Portfolio value without operational risk?** The Level-1 refactor with disciplined commits, the state-model design, the Apps Script pipeline, and this documentation set are honest, defensible portfolio pieces. A full custom backend/dashboard (Option C/D) should — if desired — be built as a separate demo against fake data, never as the school's production system holding children's records.

## Quality-bar note

Plain-language first, term second, throughout: e.g. "the same fact stored twice drifts apart" (*DRY violation*), "files as units of change" (*separation of concerns*), "things that happened are timestamps, not states" (*event vs. state modeling*). Every recommended technology names the specific problem it solves; every rejected one names the cost it would add.
