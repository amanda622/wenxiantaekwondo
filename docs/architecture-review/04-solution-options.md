# 04 — Implementation Strategy Comparison

> Four realistic strategies, scored against the state model in doc 03. Costs in SEK/month are 2026 estimates; anything marked **(verify)** must be checked against the provider's current pricing page before committing. Payment specifics are in doc 05's companion section and doc 08 decisions.

---

## Option A — Keep the static site + SaaS/automation glue

**Shape:** GitHub Pages site stays exactly as is (after Phase-1 cleanup). The form feeds a central record (Google Sheet) instead of only an inbox; small automations send acknowledgement, reminders, and surface tasks.

Two concrete variants:

### A1 — "Vendor glue": Web3Forms Pro + Make/Zapier + Google Sheets
- Form keeps posting to Web3Forms; **Pro plan** (~$8–15/mo, **verify**) adds webhooks/integrations → Make.com (free tier: 1,000 ops/mo) writes each submission to a Sheet and sends a bilingual ack via the school mailbox. Reminders = Make scheduled scenarios reading the Sheet.
- - Zero custom code; + each piece replaceable; − three vendors in the data path for one form; − Make scenarios are "code you can't diff or version".

### A2 — "One-script glue": form posts to Google Apps Script *(recommended within A)*
- The form's `action` changes to a Google Apps Script Web App URL (`doPost`). ~100 lines of JavaScript: validate + honeypot-check → append row to Sheet → send bilingual ack (MailApp) → notify school. Time-driven triggers (built into Apps Script) handle trial reminders, follow-up nags, and the "NEW > 24 h" task list. The Sheet *is* the staff view; one tab computes the funnel metrics.
- Cost: **0 kr**. Quotas (consumer Google account: ~100 MailApp recipients/day, **verify**) are far above this club's volume.
- - One vendor (Google) instead of three; the glue is real, versionable code in this repo (learning value: HTTP handling, validation, email, time triggers — a gentle backend curriculum); − you own ~100 lines of code and its failure modes; − Apps Script's editor/deployment model is idiosyncratic; − school must be comfortable with data in Google (GDPR: EU SCCs — doc 06 §subprocessors).

| Criterion | Option A (A2 variant) |
|---|---|
| Initial build effort | 2–4 evenings |
| Monthly cost | 0 kr (A1: ~100–150 kr) |
| Maintenance burden | Low; one script + one sheet |
| Technical complexity | Low-medium |
| Data ownership | School's Google account; exportable CSV anytime |
| GDPR | Must DPA-check Google Workspace/consumer terms; data in EU possible (verify region); easy deletion (delete rows) |
| Vendor lock-in | Low (sheet exports; script is portable logic) |
| Security burden | Low; no credentials on the website; script URL is the only public surface (validate + rate-limit inside) |
| Reliability | Good; Google infra; failures visible in sheet |
| Instructor ease of use | High — it's a spreadsheet |
| Reporting | Formulas/pivot on the sheet; adequate |
| Payment integration | Manual reference matching (doc 05 §payments); no webhooks |
| Junior-volunteer suitability | **Excellent** — small, inspectable, teaches fundamentals |
| Portfolio value | Good: real users, real automation, tasteful scope |
| Operational risk | Low; worst case = back to today's email flow |

## Option B — Adopt a Swedish club-management platform

**Shape:** the website stays as the marketing front; membership, fees, communication, attendance move into a platform built for Swedish föreningar. Candidates (all verified to exist and serve this segment, feature depth **verify per vendor**):

- **SportAdmin** (sportadmin.se) — member register, group management, automatic payment links + reminders, attendance (also feeds LOK-stöd reporting), comms; priced per club, historically at the higher end (**verify** sportadmin.se/priser).
- **MyClub** (myclub.se) — member register, invoicing where members pay the club directly (no middleman holding funds), membership cards, activities; per-member pricing (**verify**).
- **Svenskalag.se** — register + website + app + payment service from ~120 kr/mo depending on club size (their own published figure, **verify**); ad-funded free tier exists.
- **Zoezi** (zoezi.se) — gym/martial-arts oriented: booking, Swish/card/autogiro payments, access control. Note: the published discount agreement is with **Svenska Budo & Kampsportsförbundet**; WT taekwondo belongs to **Svenska Taekwondoförbundet (STF)** — ask STF whether a corresponding agreement exists (**verify**; decision D-14).

| Criterion | Option B |
|---|---|
| Initial build effort | Days of *configuration*, not code; plus data entry |
| Monthly cost | ~100–800 kr depending on platform/size (**verify**) |
| Maintenance burden | Near zero (vendor's problem) |
| Technical complexity | None for the club |
| Data ownership | Vendor-hosted; export usually CSV (**verify per vendor**) |
| GDPR | Strong: these vendors sell DPAs + Swedish-law compliance to thousands of clubs — better than anything homemade |
| Vendor lock-in | Real: workflows and history live in the platform |
| Security burden | Outsourced (accounts/roles still need discipline) |
| Reliability | High |
| Instructor ease of use | High (built for exactly this user) |
| Reporting | Built-in membership/payment reports; funnel-specific metrics weaker |
| Payment integration | **Best in class**: payment links/invoices auto-matched to members, reminders included — the entire doc 03 stages 10–12 problem disappears |
| Junior-volunteer suitability | Nothing to build (con for learning, pro for the school) |
| Portfolio value | Low (configuration) |
| Operational risk | Low; also *reduces* key-person risk vs. custom anything |

**Important nuance:** these platforms solve **membership + payment + attendance** superbly, but most are weak at the *pre-member* funnel (trial-application nurturing) — the gap Option A fills. They are complements, not competitors.

## Option C — Static frontend + small managed backend

**Shape:** GitHub Pages + serverless functions (Cloudflare Workers/Vercel), managed DB (Supabase/Postgres), transactional email (Resend/Postmark ~free–200 kr/mo), Stripe webhooks, small password-protected admin page.

| Criterion | Option C |
|---|---|
| Initial build effort | 3–6 weekends realistically |
| Monthly cost | 0–300 kr |
| Maintenance burden | **Meaningful**: dependencies, tokens, DB migrations, auth, monitoring — forever, on one volunteer |
| Technical complexity | Medium-high (auth is the trap: an admin view of children's data must be *properly* secured) |
| Data ownership | High |
| GDPR | All yours: DPAs with each vendor, retention jobs, access control — doable but real work |
| Vendor lock-in | Low-medium |
| Security burden | **Highest of A/B/C** — you now operate an authenticated system holding minors' data |
| Reliability | Good if built well; no one on call if not |
| Instructor ease | Depends entirely on the admin UI you build |
| Reporting | Whatever you build |
| Payment integration | Excellent (Stripe webhooks) — but see doc 05: Stripe fees vs. Swish for a small club |
| Junior-volunteer suitability | Great learning, risky ownership |
| Portfolio value | **Highest** |
| Operational risk | Medium: the school's operations now depend on your custom system and your availability |

## Option D — Fully custom application

Frontend + API + DB + admin + auth + email + payment webhooks + audit logging. For 5–30 applications/month this is a wedding cake for a fika. Build effort measured in months; every criterion above worsens except portfolio value; the school inherits an unmaintainable dependency on one volunteer. **Rejected** — kept here as the explicit YAGNI boundary (doc 02).

---

## Recommendation — a staged hybrid: **A2 now, B at the payment step, C never for the school (optionally as a separate portfolio project)**

1. **Now (Phases 1–3, doc 07):** Option **A2**. Keep the static site; route the form through one small Apps Script into a Google Sheet; auto-ack, reminders, staff view, metrics tab. Zero cost, reversible in one line (point the form back at Web3Forms), and it implements the doc 03 state model exactly. *If the school prefers zero custom code*, A1 is the fallback at ~100–150 kr/mo.
2. **At the payment/membership step (Phase 4):** evaluate Option **B** seriously before building anything. Payment matching, invoicing, reminders, and the member register are precisely what SportAdmin/MyClub/Svenskalag/Zoezi industrialize, with GDPR posture included. A volunteer-built payment-matching system is the roadmap's worst cost/benefit. Bridge until then: Swish Företag with per-applicant reference codes, matched semi-manually in the Sheet (doc 05 §payments).
3. **Option C/D:** not for the school's operational path. If the portfolio goal matters, build a C-style demo *against fake data* in a separate repo — full portfolio value, zero operational risk to real families (answers final question 7, doc README).

**Why this order (the reasoning to internalize):** automate the top of the funnel with the cheapest reversible tool, because that's where applicants are lost today (doc 03 A.2); buy the bottom of the funnel, because payment+register is commodity club infrastructure with regulatory weight; never let the learning goal put children's data on a hobby backend.
