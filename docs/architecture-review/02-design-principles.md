# 02 — Design-Principle Review

> This is deliberately **not a scorecard**. Counting "violations" of principles tells you nothing; what matters is *cost*: does the current shape of the code make a change you actually need slower, riskier, or impossible? Each principle below gets a classification, evidence, and — most importantly — which of these five categories it falls into:
>
> 1. **Actual engineering problem** — costs you time/money/users today or in the next planned step.
> 2. **Theoretical pattern violation** — a textbook would object; nobody here is harmed.
> 3. **Reasonable shortcut for a small static site** — the "violation" is the correct trade-off.
> 4. **Premature abstraction risk** — "fixing" it now would add cost without benefit.
> 5. **Necessary preparation for the automation workflow** — must be addressed *because of the roadmap*, not because of principle purity.

Classifications: `not relevant` · `acceptable at current scale` · `mild issue` · `meaningful issue` · `blocking future development`.

---

## Separation of Concerns — **meaningful issue** (category 1 + 5)

- **What it means in plain language:** keep "what the page says" (content), "how it looks" (style), and "how it behaves" (logic) in places you can change independently.
- **Here:** all three live in one file (doc 01 §2). The *conceptual* separation is actually decent — CSS is sectioned, JS is in three coherent blocks, i18n uses a clean attribute mechanism. The problem is *physical*: you cannot edit the schedule without scrolling past 1,300 lines of CSS, cannot diff a copy change without noise, and cannot let a second volunteer touch translations without merge-conflict roulette in a 237 KB file.
- **What a beginner misunderstands:** SoC is not "more files = better". It's "one reason to open one file". A 2,400-line file with clear internal sections is *closer* to separated than five files that all know about each other.
- **Overengineering here would be:** components, imports, a build step. **Smallest useful improvement:** the Level-1 file split (doc 05) — same code, new addresses.

## Single Responsibility Principle — **acceptable at current scale** (category 3)

- The three script blocks each have one job (i18n / scroll effects / media modal) — SRP is *informally satisfied*. `applyLang` (2218) does five things (text, HTML, placeholders, ribbon, button label) but they are all "apply language", cohesive enough.
- **Beginner misunderstanding:** SRP applies to *reasons to change*, not to "functions must be tiny". `applyLang` changes only when the i18n mechanism changes — that's one reason.
- No action needed beyond the file split.

## DRY (Don't Repeat Yourself) — **meaningful issue** (category 1)

- **Evidence:** doc 01 F-02 (every Swedish string twice, *already drifted*), gallery double-list, schedule triple-rendering, 16× copy-pasted SVG.
- **Why this one is "actual" and not "theoretical":** the drift has already happened (`index.html:1937` shows Chinese to Swedish no-JS visitors). DRY violations become real problems exactly when copies diverge — this repo has crossed that line.
- **Beginner misunderstanding:** DRY is about *knowledge*, not text. The 16 SVG copies are ugly but harmless (they never change independently). The two copies of `test2.text` are dangerous (they are supposed to be the same fact and aren't). Prioritize the second kind.
- **Smallest useful improvement:** make `T` the single source of truth — generate nothing, just accept a brief flash-of-default and reduce inline defaults to Swedish-only (or, in the Level-1 split, keep HTML as the sv source and delete `T.sv`, keeping only `T.zh` overrides). Either direction works; pick **one** authority (doc 05 recommends which).

## KISS — **acceptable at current scale** (category 3, mostly honored)

- The site is refreshingly simple: no framework, no build, no state management, native form POST. This is a *strength* — protect it. The complexity that exists (modal history handling) pays for real UX.
- The one place simplicity was violated: embedding a 140 KB base64 image in CSS (line 132) to avoid… a file. That's *complification* posing as simplification — an `assets/hero.jpg` reference is simpler and cacheable.

## YAGNI — **mild issue, inverted** (category 3/4)

- Nothing speculative was built — good. The YAGNI risk here points at the *future*: the temptation to build a custom backend/dashboard (Option D, doc 04) for a school with a handful of applications per week. The review's job is to stop that. **You aren't gonna need** a database, auth system, or API for Phase 2 — a spreadsheet reaches the same goal (doc 04).

## Open/Closed Principle — **not relevant** (category 2)

- OCP targets systems extended by third parties or plugins. A one-page club site has no extension surface. The nearest useful reading: "adding a gallery photo shouldn't require editing logic" — true, and solved by driving the gallery from the `mediaItems` array (doc 05, step F-05), which is an OCP-flavored fix justified by *maintenance cost*, not by the principle.

## Dependency Inversion — **not relevant as a pattern; relevant as one question** (category 2 → 5)

- No modules, no injected dependencies — inverting anything here would be cargo-culting.
- The *one* DIP-shaped question that matters: **the site depends directly on Web3Forms' URL and field format** (1790). When automation arrives, put a decision point between "form submitted" and "what happens next" (a webhook/endpoint you control routing to sheet+email — doc 04/05). That is dependency inversion in spirit: the site should depend on *"an application intake"*, not on one vendor's endpoint. Do this in Phase 2, not before.

## Cohesion and coupling — **mild issue** (category 1, small)

- High cohesion within script blocks (good). Coupling problems are data-shaped, not module-shaped: gallery HTML ↔ `mediaItems` order coupling (index-based navigation), schedule ↔ three renderings, inline `style=` attributes coupling markup to presentation (~60 occurrences).
- **Beginner misunderstanding:** coupling isn't only "module A imports module B" — two lists that must stay in the same order are coupled *with no compiler to tell you*. That's the worst kind: invisible coupling.

## Progressive enhancement — **acceptable, partially accidental** (category 3)

- Works without JS: the form (native POST — excellent), content reading, anchor links. Breaks without JS: language switching (Chinese users get Swedish), gallery/video modal (images simply don't open — cards are `<div onclick>`, not links), fade-ins leave content visible (checked: `.fade-in` initial opacity is animated in, but `visible` class is required — verify during Phase 1 that content is not opacity-0 without JS).
- **Smallest improvement:** make gallery cards real `<a href="10.jpg">` links that JS upgrades to a modal — no-JS users get the image, keyboard users get focusability, and F-12 partially resolves itself. This is the textbook progressive-enhancement move and worth learning properly.

## Accessibility — **meaningful issue** (category 1)

- Doc 01 F-12: unassociated labels on the revenue-critical form, keyboard-inaccessible gallery, empty `alt`. Also `lang` attribute handling is actually *good* (`applyLang` sets `document.documentElement.lang`, 2221) — credit where due.
- **Why it matters beyond ethics/law:** label-input association is also what makes mobile browsers focus the right field when tapping a label, and what password-manager/autofill heuristics use. Accessibility fixes here are UX fixes for everyone.
- **Smallest improvement:** `for`/`id` pairs + `required` + real links for gallery cards — under an hour, no visual change.

## Security boundaries — **meaningful issue** (category 1 + 5)

- The architecture has exactly one trust boundary: browser → Web3Forms. Everything client-side is attacker-controlled: the access key is public **by design** (Web3Forms' model), so the *only* protections available are what Web3Forms enforces (spam filtering, optional hCaptcha, optional domain allow-listing on paid plans — verify current plan features). Currently none of the optional ones are enabled (no honeypot `botcheck` field, no hCaptcha widget).
- **Beginner misunderstanding:** "the key is in the HTML, we've been hacked!" — no. Client-side form services are built around public keys; the key only lets someone *send you submissions*. The real risks are spam floods and junk data, mitigated by captcha/honeypot/domain-locking, never by hiding the key.
- No other secrets exist in the repo or its git history (scanned all commits).

## Privacy by design — **meaningful issue** (category 1)

- Collecting children's full birth dates with no notice, no consent, no stated retention, delivered to a consumer mailbox — this is the weakest area of the project and has its own document (06). The *design* fix (collect less, say what you do, define retention) is cheap; the organizational fixes need the school.

## Maintainability — **mild-to-meaningful issue** (category 1)

- One volunteer can hold this file in their head today. The failure mode is *bus factor and friction*: every change risks the whole page (one bad bracket in line 900 of CSS breaks everything below), diffs are noisy, and a second contributor is locked out in practice. The Level-1 split + a README + removing dead media addresses 80 % of it.

## Testability — **acceptable at current scale, with one exception** (category 3 → 5)

- Formal tests for a static brochure page would be overengineering. The pragmatic testing story is: (a) a manual pre-deploy checklist (doc 07 Phase 0 records it), (b) once translations move to a data file, a 20-line script can assert "every key in `T.zh` exists in `T.sv`" — the only unit-testable pure logic on the site and a *great first automated test to learn on*, (c) once automation exists (Phase 2+), test *that* — the workflow logic is where correctness will matter.
- **Beginner misunderstanding:** testability isn't "write tests for everything"; it's "structure things so the parts that can silently break are checkable". Here that's exactly one thing today: i18n key parity.

---

## Summary table

| Principle | Classification | Category | Act? |
|---|---|---|---|
| Separation of Concerns | meaningful | 1+5 | Level-1 split (Phase 1) |
| SRP | acceptable | 3 | no |
| DRY | meaningful | 1 | single i18n authority (Phase 1) |
| KISS | acceptable (honored) | 3 | un-embed base64 hero |
| YAGNI | acceptable — guard the future | 4 | resist Option D |
| Open/Closed | not relevant | 2 | gallery-from-data is optional |
| Dependency Inversion | not relevant today | 2→5 | intake decision point in Phase 2 |
| Cohesion/coupling | mild | 1 | fold into split |
| Progressive enhancement | acceptable | 3 | gallery cards → real links |
| Accessibility | meaningful | 1 | labels/required/links now |
| Security boundaries | meaningful | 1+5 | honeypot+captcha now |
| Privacy by design | meaningful | 1 | doc 06, Phase 1 |
| Maintainability | mild-meaningful | 1 | split + README + dead media |
| Testability | acceptable | 3→5 | key-parity check after split |

**Nothing here is "blocking future development"** — that's the honest headline. The site is a healthy small static site with a weak form and heavy media. The principles that matter (privacy, security boundary, a11y, DRY-where-drifted) all have sub-day fixes.
