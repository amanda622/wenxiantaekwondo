# 07 — Phased Roadmap (+ Metrics & Dashboard Design)

> Rule for every phase: **the production site keeps working throughout.** Each phase is independently shippable, independently revertible, and ends with the site in a better state than it started. Do not start a phase before the previous one's acceptance criteria pass. Metrics design (brief Part 10) is at the end because Phase 2 creates the data it needs.

---

## Phase 0 — Audit and backup *(one evening)*

- **Goal:** a documented, restorable baseline. **User-visible outcome:** none (by design).
- **Scope:** tag current commit (`git tag v1-baseline && git push --tags`); screenshot production at 375/768/1280 px in both languages; save a `curl` copy of the live HTML; record a Lighthouse run (performance/a11y/SEO numbers become the before-picture); submit **one real test application** and document exactly what arrives where (fills the ❓s in doc 03 A.1 rows 2–4); log into Web3Forms and record plan, delivery address, stored submissions; verify Pages settings (branch, HTTPS enforced) and Loopia DNS records into `docs/runbook.md`; confirm doc 06 §1 secrets findings.
- **Dependencies:** access to Web3Forms account + Loopia ❓. **Risk:** none. **Rollback:** n/a.
- **Acceptance:** a new contributor could redeploy the site and describe the form pipeline using `docs/runbook.md` alone.
- **Deliberately postponed:** all changes.

## Phase 1 — Low-risk cleanup: content, form integrity, media, split *(2–4 evenings, ship in small commits)*

- **Goal:** fix everything marked "now" in doc 01 without touching the workflow. **User-visible outcome:** faster site, working mobile nav, honest form section, privacy notice, bilingual thank-you page.
- **Exact scope, in commit-sized steps** (details: doc 05 A.4; GDPR items: doc 06 §2):
  1. Content one-liners: remove "via Recess.tv" (F-01) + stale comment; fix dates/©/`max` year (F-09); resolve testimonials after D-11 (F-08); real social URLs or remove icons (F-10); regenerate Maps embed (F-10).
  2. Form integrity: `required`, option `value`s, honeypot + hCaptcha, `redirect` → new `tack.html`, guardian-name field, drop birth month/day, consent checkbox + `integritet.html` (F-03/F-04 partial, doc 06 §2).
  3. Head/a11y quick wins: meta description + OG tags + favicon; `label for`/`id`; gallery cards → real links (F-11/F-12).
  4. Mobile nav: minimal hamburger (a `<details>`-based or 10-line JS toggle — resist a nav framework) (F-05).
  5. Media: delete unused mp4s; re-encode images; replace 14 MB instructor photo (F-06/F-07).
  6. Level-1 split + single i18n source (doc 05 A.4 steps 1–3).
- **Files:** `index.html`, new `css/`, `js/`, `assets/`, `tack.html`, `integritet.html`. **Dependencies:** D-11 (testimonials), D-01 (form purpose wording), consent text sign-off.
- **Risks:** visual regression (mitigation: per-step verification at 3 widths, both languages); form breakage (mitigation: test submission after *every* form-touching commit).
- **Rollback:** `git revert` per commit; worst case `git reset` to `v1-baseline`.
- **Acceptance:** Lighthouse perf/a11y meaningfully up vs. Phase 0 baseline; test submission arrives with machine-readable values; submitting redirects to `tack.html` in the right language; nav usable on a phone; total page transfer < 5 MB.
- **Postponed:** any workflow/automation change; git-history rewrite (optional, coordinate); inline-style cleanup; gallery-from-data.

## Phase 2 — Applicant-tracking MVP *(2–4 evenings)* — **the smallest useful automation**

- **Goal:** every application becomes a record with a state; every applicant gets an instant bilingual acknowledgement. **User-visible outcome (family):** immediate professional confirmation email. **(Staff):** one Sheet showing every applicant and what to do next.
- **Scope:** Google Sheet with doc 03 B.5 columns; Apps Script `doPost` (validate + honeypot → append row, state `NEW` → bilingual ack via club mailbox → notify staff); form `action` switched to the script URL; "needs attention" filter view (`NEW` > 24 h); metrics tab (see §Metrics). Keep Web3Forms as documented fallback (one-line revert).
- **Files/systems:** `index.html` (one attribute), new `apps-script/` folder in repo holding the script source (version it here even though it runs in Google), Sheet (outside repo). **Dependencies:** D-04 (sending mailbox), D-02 (controller), doc 06 §3 access rules.
- **Risks:** script quota/failure → mitigations: failures visible as missing ack + staff notification; fallback endpoint documented. Deliverability of ack emails (SPF for the mailbox ❓ — test with common providers).
- **Rollback:** point form back to Web3Forms.
- **Acceptance:** test application → row appears with timestamps, family receives sv ack (and zh when form used in zh — send both languages if simpler), staff notified; a week of real use produces zero lost applications.
- **Postponed:** booking, reminders, payments, any dashboard beyond the Sheet.

## Phase 3 — Trial booking and reminders *(1–2 evenings on top of Phase 2)*

- **Goal:** doc 03 stages 6–9 stop depending on memory.
- **Scope:** staff enters `trial_date` on the row → time-driven trigger sends confirmation now + reminder at `trial_date` − 1 day; day-after prompt asks staff to mark `ATTENDED`/`NO_SHOW`; `ATTENDED` + 2 days without follow-up → nag with a message template. **Design choice (D-05, recommended):** applicants do *not* pick exact dates on the website — staff proposes after contact. This avoids calendar-sync complexity entirely and matches how a small dojo actually schedules; revisit only if volume makes proposing dates a burden (then: a booking SaaS, not custom code).
- **Risks:** trigger misfires → weekly staff glance at the Sheet catches gaps (the Sheet remains the truth; automation only *assists*).
- **Rollback:** disable triggers; Sheet still works manually.
- **Acceptance:** one full real cycle: booked → confirmed → reminded → marked → follow-up nagged.
- **Postponed:** self-service booking, calendar integrations, no-show auto-messaging.

## Phase 4 — Payment workflow *(bridge, then platform decision)*

- **Goal:** doc 03 stages 10–12 become reliable. **Scope (bridge):** Swish Företag agreement via the club's bank (D-09 ⚖️); Sheet generates `WX-<year>-<nnn>` references; payment-request email template with amount + reference; weekly matching routine (mark `paid_at`); `OFFER` + 7 days unpaid → reminder. **Scope (decision):** trial the doc 04 Option-B platforms against D-12/D-13 requirements; if adopted, `MEMBER` handoff = export from Sheet → platform, and the platform owns invoicing from then on.
- **Dependencies:** bank agreement (weeks of lead time — start early ⚖️); treasurer buy-in; D-10 (can students train before payment?).
- **Risks:** unmatched payments (reference forgotten) → fallback: match by amount+date+name, note on record. **Rollback:** manual instructions as today.
- **Acceptance:** a full termin's payments matched with < 30 min/week of treasurer time; zero "paid but chased" incidents.
- **Postponed:** Stripe/card payments, webhooks, autogiro — unless the platform brings them.

## Phase 5 — Reporting and operational hardening *(ongoing, light)*

- **Goal:** the system survives volunteers changing and audits arriving. **Scope:** metrics tab reviewed monthly (below); retention routine (doc 06 §4.4: filter + delete/anonymize expired rows, quarterly calendar reminder); monthly Sheet export backup; `docs/runbook.md` grows a "handover" section (accounts, access, how-tos); failure monitoring = the "needs attention" view + a monthly test submission.
- **Acceptance:** a new volunteer can run the whole funnel from the runbook; a GDPR deletion request is executable in < 15 minutes; the instructor answers "how many trials converted this termin?" in one glance.
- **Postponed forever, unless facts change:** custom dashboard app, database, auth system (doc 04 Option C/D boundary).

---

## Metrics & minimal dashboard (brief Part 10)

**Form: one tab in the Sheet, computed by formulas from the state/timestamp columns. No new tools.** Review monthly; per-termin is the natural reporting window for a club (weekly numbers at this volume are noise).

| Metric | Definition | Data needed | Calculation | Window | Verdict | Privacy |
|---|---|---|---|---|---|---|
| New applications | rows created | `created_at` | count | per month + per termin | **Useful** — the top-of-funnel pulse | aggregate only |
| Response time | median h from `created_at` → `contacted_at` | both timestamps | median | per month | **Useful** — directly tests the "24 h" promise | aggregate |
| Trials booked / attended / no-shows | state counts | states + `trial_date` | count | per termin | **Useful** — no-show rate validates Phase 3's reminders | aggregate |
| Follow-ups due | `ATTENDED` && no `followed_up_at` | timestamps | live count | now | **Useful** — it's a to-do list, the most actionable "metric" | names visible to staff only |
| Awaiting payment | `OFFER` && `payment_requested_at` && !`paid_at` | timestamps | live count + total kr | now | **Useful** | staff only |
| **Application → member conversion** | `MEMBER` / all closed rows of a cohort | states by `created_at` cohort | % | per termin | **The headline number** — everything else explains its movement | aggregate |
| Applicants by class/age group | class field | `klass` | count | per termin | **Useful** — capacity planning (which classes to expand) | aggregate; class not sensitive |
| Lead source | "how did you find us?" answer | new optional form field | count | per termin | **Useful if collected**; keep options coarse (Maps/friend/school/other) — that's the responsible version | optional, coarse, aggregate |
| Website page views / visitors | — | would require analytics | — | — | **Vanity at this scale — skip.** Applications are the signal; adding a tracker to count anonymous scrolls buys consent complexity for no decision it would change | avoided entirely |
| Cumulative "total members ever" | — | — | — | — | **Vanity — skip** (only ever goes up; informs nothing) | — |

**Anti-vanity rule to keep:** every metric must name the decision it feeds (expand a class, fix reminders, chase payments, staff the inbox). If nobody would act differently when the number moves, delete the metric.
