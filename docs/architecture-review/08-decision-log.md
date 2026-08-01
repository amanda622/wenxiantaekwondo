# 08 — Decision Log

> Decisions the club must make. **Blocking** = a roadmap phase cannot ship without it. **Deferrable** = a labeled assumption is safe meanwhile. Column "Assumed in this review" records what the analysis presumed so nothing is hidden inside the documents.

## Blocking decisions

| ID | Decision | Blocks | Assumed in this review | Notes |
|---|---|---|---|---|
| D-01 | Is the form a **trial-lesson request** or a **membership registration**? | Phase 1 (wording, consent text) | Trial request (matches `index.html:1758` "Prova en gratis lektion") | Membership registration would change required data (doc 06 §2.2) |
| D-02 | Who is the **data controller**, and does the board acknowledge it? | Phase 1 (privacy notice must name it) | The förening, org.nr 802521-1049 | ⚖️ doc 06 §4.1 |
| D-03 | Who is **responsible for responding** to applications, with what backup person? | Phase 2 (who gets notifications/tasks) | The head instructor, no backup | The state model surfaces, but cannot fix, an unowned inbox |
| D-04 | Which **mailbox sends automatic emails** and receives applications? | Phase 2 | `wenxiantaekwondo@outlook.com` (unverified) | Club-owned, not personal; affects deliverability testing (doc 07 P2) |
| D-11 | Are the **testimonials real people who consented**? | Phase 1 step 1 | Unknown; treated as likely template placeholders | Real → fix stale roles + record consent; not real → replace (doc 01 F-08) |
| D-08 | **Retention period** for non-converted applicants | Phase 1 (must be stated in notice) | 6 months, then delete/anonymize | ⚖️ doc 06 §4.4 |
| D-09 | **Payment method** for the bridge period — Swish Företag? Which bank? Who signs? | Phase 4 | Swish Företag via existing club bank | Weeks of lead time; start early |
| D-15 | **Photo consent** for recognizable minors in the gallery | Phase 1 acceptance | Assumed not yet documented | ⚖️ doc 06 §4.2 |

## Deferrable decisions (safe defaults in place)

| ID | Decision | Needed by | Default assumed |
|---|---|---|---|
| D-05 | Should applicants pick an **exact trial date** on the site? | Phase 3 | No — staff proposes after contact (doc 07 P3 rationale) |
| D-06 | Is **instructor approval** required before a trial is booked? | Phase 3 | Yes implicitly (staff makes the booking) |
| D-07 | What counts as **attendance** (arrived? completed? guardian present?) | Phase 3 | Child participated in the session |
| D-10 | May a student **train before payment** is received? How many sessions? Refund policy line? | Phase 4 | Trial free; from session 2 payment requested; refunds case-by-case by board |
| D-12 | Is the fee strictly **per termin**? Sibling discounts? Mid-termin starts pro-rated? | Phase 4 | Flat 1,700 kr/termin as published |
| D-13 | Is **"inkl. moms"** correct for a förening's fees? | Phase 1 wording / Phase 4 bookkeeping | Likely VAT-exempt; treasurer confirms (doc 01 F-13) ⚖️ |
| D-14 | Willingness to pay a **monthly SaaS fee**, and does STF have a **platform agreement** (cf. Budo-förbundet × Zoezi)? | Phase 4 platform choice | Up to ~300 kr/mo acceptable if it saves treasurer hours |
| D-16 | Who can access the **applicant Sheet** (named list)? | Phase 2 | Instructor + maintainer, 2FA |
| D-17 | Should automatic emails go out in **both Swedish and Chinese**? | Phase 2 | Yes — both languages in one email (no language-detection complexity) |
| D-18 | Add optional **"how did you find us?"** field? | Phase 2 | Yes, coarse options (doc 07 metrics) |
| D-19 | Rewrite **git history** to shrink the 144 MB `.git`? | Any time after Phase 1 | Optional; coordinate, tag first (doc 05 A.4 step 4) |

## How to use this log

Work through the blocking rows top-to-bottom at one board/instructor meeting — none needs more than five minutes, and D-02/D-08/D-15 mostly need a "yes, noted". Record the answer in this file (it's in the repo precisely so decisions live next to the code they govern), then unblock the corresponding phase.
