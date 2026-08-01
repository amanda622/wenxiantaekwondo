# 00 — Learning Master Plan — Wenxian Taekwondo Website

> **What this file is:** your long-term control document. Open it at the start of every future Claude session, pick **one** checkpoint from section 4, and work only on that. The goal is not a finished website — it is that *you* become better at reading, refactoring, and designing systems, using a real production site with real users as the training ground.
>
> **How to keep it alive:** when a checkpoint is done, mark it `✅ done <date> <commit>` right here in this file. When a decision from section 8 gets answered, write the answer into `08-decision-log.md`. This file is only useful if it stays current.
>
> Written 2026-07-13 against `main` @ `45c9c91`. If months have passed, re-verify line numbers with `grep -n` before trusting them — code moves, findings age.

---

## 1. One-page project summary

**What the website does:** a single page at https://wenxiantaekwondo.se presents a taekwondo school in Gothenburg in Swedish and Chinese — classes, weekly schedule, photos, YouTube videos, prices, instructor bio, contact info — and offers a trial-lesson application form. The form sends an email to the school; everything after that email (calling the family, booking the trial, reminders, payment) is done by hand and memory.

**What already works and should be respected:** the site is live, found via Google Maps, and real families apply through it. The hosting costs nothing (GitHub Pages) and the domain works (bought at Loopia, connected via the `CNAME` file). The design is coherent, the language toggle works, the photo/video pop-up is genuinely well built, and the form works even if JavaScript is turned off. **This is a functioning product, not a broken one.**

**The current production setup, in one breath:** one file, `index.html` (2,383 lines), contains all styling, all content, and all behavior. Photos and videos sit next to it in the repository root. Pushing to the `main` branch on GitHub *is* deploying to production — there is no staging, no build step, no test.

**The biggest real-world risks, in order:**
1. **Families fall through the cracks** — an applicant gets no confirmation, and the school gets one easy-to-miss email (see `03-business-workflow.md` §A.2).
2. **Children's data is collected carelessly** — full birth dates of 5-year-olds, no privacy notice, no consent, and the page even names the *wrong* form company ("via Recess.tv" while the data actually goes to Web3Forms) (`06-gdpr-security.md`).
3. **The page is enormous on mobile** — up to ~60 MB of images for a full scroll, and the navigation menu simply disappears on phones (`01-current-state.md` F-05/F-07).
4. **One volunteer, one giant file** — every edit risks the whole page, and nobody else can realistically help (`02-design-principles.md`, Maintainability).

**What must NOT be overengineered:** no framework (React/Vue), no build pipeline, no database, no custom backend, no login system. The single page, the free hosting, and the "edit → push → live in a minute" loop are *features*. The review's verdict (`04-solution-options.md`): the most advanced thing this project should ever own is ~100 lines of Google Apps Script and a spreadsheet.

---

## 2. The most important findings (real-world priority order)

| # | Finding | Why it matters | Evidence | Affected | Severity | Type |
|---|---|---|---|---|---|---|
| 1 | **No acknowledgement, no record — applicants can vanish silently** | The one email per applicant is the entire system; a missed email = a lost family, and nobody would ever know | `03-business-workflow.md` §A.1–A.2, `01` F-04 | Web3Forms → inbox pipeline | High | Production risk **and** the central learning topic (workflow design) |
| 2 | **Children's data collected without notice, consent, or minimization** | Full DOB of minors + no privacy page + no retention plan; cheap to fix, expensive to ignore | `06-gdpr-security.md` §2 | `index.html:1790–1841` (form) | High | Production risk + business decision (consent text, retention) |
| 3 | **Form header names the wrong company** — "via Recess.tv" but data goes to Web3Forms | The site misinforms families about where their data goes; also just embarrassing | `01` F-01 | `index.html:1788`, stale comment `:656` | High | Production risk (5-minute fix; also a lesson: *visible text must match code*) |
| 4 | **Form accepts anything from anyone** — no `required`, no spam guard, and dropdown values change with the display language | Junk reaches the inbox today; worse, inconsistent values ("Mini Klass…" vs "儿童基础班…") will poison any future automation | `01` F-03 | `index.html:1796–1835` | High | Production risk + learning topic (validation, data design) |
| 5 | **~60 MB page, 14 MB instructor photo, 38.7 MB of unused videos** | Slow first impression on the phones most visitors use; dead weight in every clone | `01` F-06/F-07 | media files, `index.html:1657–1720, 1898` | High | Production risk (mechanical fix, big payoff) |
| 6 | **Mobile navigation is `display:none` with no replacement** | Google-Maps visitors are on phones; they get no menu and no register button in the nav | `01` F-05 | `index.html:1162` | High | Production risk + small learning topic (responsive patterns) |
| 7 | **Every Swedish string exists twice and has already drifted** | Two copies of the same fact always drift; line 1937 shows Chinese to no-JS visitors as proof | `01` F-02, `02` DRY | inline HTML + `T.sv` (2062–2137) | Medium | **The** learning topic of this repo (single source of truth) |
| 8 | **Testimonials reference classes that don't exist** ("Mini Tigers"…) | If placeholders → fabricated reviews (marketing-law + trust problem); if real → stale + consent question | `01` F-08 | `index.html:1924–1957` | Medium | Business decision (D-11) — *ask, don't code* |
| 9 | **Gallery is two parallel lists that must stay in sync** (16 HTML cards + `mediaItems` array) | Invisible coupling: add a photo in one place and the modal navigation silently misbehaves | `01` §5 | `index.html:1657–1720` vs `2280–2301` | Medium | Learning topic (coupling you can't see) |
| 10 | **No meta description, favicon, or link-preview tags** | Ugly Google snippets and WeChat/WhatsApp shares — a real recruitment cost | `01` F-11 | `index.html:1–7` | Medium | Production nicety (mechanical) |
| 11 | **Form labels not connected to inputs; gallery unusable by keyboard** | The revenue-critical form is hostile to screen readers and autofill | `01` F-12 | form + gallery markup | Medium | Learning topic (accessibility as UX) |
| 12 | **Stale hard-coded facts** (schedule note "fr.o.m. 2 juni 2025", © 2025, birth-year max 2025, "inkl. moms"?) | Signals an unmaintained site; the year cap rejects children born 2026; moms wording needs the treasurer | `01` F-09/F-13 | `index.html:1644, 1806, 1877, 2056` | Low | Quick fixes + one business decision (D-13) |

---

## 3. What I should learn from this project (syllabus)

Each topic: **concept → where it lives here → how to practice → the beginner trap.**

1. **Reading a real codebase before judging it.** Where: the whole of `index.html`. Practice: for any claim (mine or an AI's), find the line with `grep -n` and read 20 lines around it before believing it. Trap: beginners read *about* code (docs, summaries) instead of reading code; or they judge by size ("2,383 lines = bad") instead of by cost.
2. **Identifying responsibilities.** Where: the three script blocks (i18n / effects / modal) each have one job — the file is monolithic *physically*, not *conceptually*. Practice: write a one-line "this exists to…" for every block before splitting anything. Trap: thinking responsibility = file boundaries. It's *reasons to change*, wherever they live.
3. **Separation of concerns.** Where: checkpoint 13–14 (CSS/JS extraction). Practice: perform a split where the diff is provably "moved, not changed". Trap: "more files = better architecture". The win is *one reason to open one file*, nothing else.
4. **DRY and single source of truth.** Where: the duplicated Swedish strings (finding 7) and the double gallery list (finding 9). Practice: checkpoint 15 — pick one authority for Swedish text and delete the other. Trap: deduplicating *text* instead of *knowledge* — the 16 copy-pasted SVG icons are harmless; the two copies of a testimonial are dangerous. Learn to tell them apart.
5. **Safe refactoring.** Where: every checkpoint in track E. Practice: the ritual — baseline tag, one mechanical change, side-by-side visual check at 3 widths, separate commit, next change. Trap: mixing "move code" and "improve code" in one commit; when it breaks, you can't tell which intention failed.
6. **Static-site architecture.** Where: GitHub Pages + CNAME + Loopia (documented in checkpoint 3's runbook). Practice: explain to yourself in writing how a browser request for `wenxiantaekwondo.se` ends at a file in this repo (DNS → CNAME record → Pages → `index.html`). Trap: assuming a "real" site needs a server. This one needs a file host, and that's an *advantage*.
7. **Form pipeline design.** Where: form → Web3Forms → inbox today; form → Apps Script → Sheet + ack later (`05` §C). Practice: checkpoint 3 (document today's pipeline), then checkpoints 17–19 (build the new one *alongside* the old, switch with one attribute). Trap: trusting the client. Everything arriving from a browser is unvalidated text from a stranger — validate at the receiving end, always.
8. **Applicant status workflow (state modeling).** Where: `03-business-workflow.md` §B — 9 states, and the rule *"things that happened are timestamps, not states"*. Practice: walk one imaginary family through every transition on paper; then do it in the Sheet. Trap: modeling every event as a state until the diagram is spaghetti. A state answers exactly one question: *what should a human do next?*
9. **Automation vs. custom backend.** Where: `04-solution-options.md` (A2 chosen; C/D rejected). Practice: for any feature idea, write the A/B/C/D one-liner: glue it, buy it, host it, build it — and name the monthly cost and the failure owner of each. Trap: equating "I built it myself" with "better". For a volunteer club, *boring and replaceable* beats *impressive and orphaned*.
10. **GDPR and children's data.** Where: `06-gdpr-security.md`. Practice: checkpoint 8 — write the privacy page yourself in plain Swedish first, then translate to legalese only where necessary; apply data minimization by *deleting* the birth-month/day fields. Trap: thinking GDPR = a cookie banner. Here it's the opposite: collect less, say what you do, delete on schedule — no banner needed at all.
11. **Payment workflow thinking.** Where: `05` §B — Swish reference codes now, platform later. Practice: dry-run the matching problem: parent Chen pays for child Lindqvist-Chen with no message — now what? Design the reference code so that question never arises. Trap: jumping to Stripe/webhooks because tutorials do. The hard part of payments at this scale is *matching*, not *processing* — and matching is solved by a good reference, not by code.
12. **Dashboard and funnel metrics.** Where: `07-roadmap.md` §Metrics. Practice: before adding any number, complete the sentence "when this number moves, we will ___". Delete the metric if the blank stays empty. Trap: page views. They feel like progress and inform no decision this club can take.
13. **When not to build (YAGNI in practice).** Where: section 9 of this file. Practice: keep a "not yet" list with *revisit conditions* ("if applications exceed 100/month…") instead of flat bans — that turns discipline into engineering. Trap: believing restraint is a lack of ambition. Deciding *against* building is an architecture decision, and usually the hardest one.

---

## 4. Recommended learning checkpoints

> One checkpoint = one focused session. Never combine. If a checkpoint says **STOP**, the session ends with a question to a human, not with code.
> Order revised from your draft list in two ways, following the review: **media cleanup and mobile nav come before the file split** (users feel them; the split only helps you), and **"introduce course data" is demoted** to an inspect-only checkpoint (16) because the review found a lighter fix (single i18n source) covers most of that pain.
> All commands run from the repo root: `cd ~/Documents/projects/Others/跆拳道网站/wenxiantaekwondo`

### Track A — Understand before touching

**CP-1 · Read the review and verify it yourself** — no edits
- **Goal:** trust nothing on authority; confirm three findings with your own hands. **Why now:** everything later depends on you *knowing* these facts, not remembering them.
- **Inspect:** `docs/architecture-review/01-current-state.md` beside `index.html`.
- **Run:** `grep -n "Recess" index.html` · `grep -c required index.html` · `grep -n "display: none" index.html` · `du -sh *.mp4`
- **Understand first / may change / must not change:** understand F-01, F-03, F-05 end-to-end; change nothing; everything is forbidden.
- **Verify:** you can explain each of the three findings to someone else in two sentences without opening the doc.
- **Commit:** none. **Model:** Sonnet (or none — this works fine alone). **STOP:** not needed.

**CP-2 · Baseline commit and safety net**
- **Goal:** a restore point that makes every later mistake cheap. **Why now:** rollback must exist before change #1.
- **Inspect:** `git log --oneline -5`, GitHub Pages settings in the repo's web UI.
- **Run:** `git status` (expect only untracked `docs/`) · `git add docs/ && git commit -m "docs: add architecture review and learning plan"` · `git tag v1-baseline && git push origin main --tags`
- **Understand first:** what a tag is (a permanent name for a commit) and that pushing `main` deploys production.
- **May change:** git history (additive only). **Must not change:** `index.html`, media, `CNAME`.
- **Verify:** site still renders identically (docs don't affect Pages); `git tag` lists `v1-baseline`; take the section-5 screenshots now.
- **Commit:** as above. **Model:** Sonnet. **STOP:** if `git status` shows *anything* modified beyond untracked docs — investigate before committing.

**CP-3 · Document the form pipeline as it really is**
- **Goal:** replace the review's ❓ assumptions with facts; produce `docs/runbook.md`. **Why now:** you are about to change the form; you must know its true behavior first.
- **Inspect:** Web3Forms dashboard (plan, delivery address, stored submissions), the receiving inbox, `index.html:1790–1841`.
- **Run:** submit one clearly-marked test application ("TEST — radera") from the live site, in both languages; time the email's arrival.
- **Understand first:** where the data goes, what the email looks like, what the applicant sees after submitting (the off-site Web3Forms page — experience it yourself).
- **May change:** create `docs/runbook.md` (pipeline, accounts, DNS/Pages notes). **Must not change:** application code.
- **Verify:** runbook answers: who receives? which plan? what does the submitter see? what's stored where, how long?
- **Commit:** `docs: add runbook documenting current form pipeline`. **Model:** Sonnet. **STOP:** if you can't access the Web3Forms account — find who created it before proceeding (likely blocking later checkpoints too).

### Track B — Honest content (tiny, high-trust edits)

**CP-4 · Remove the false provider label and stale facts**
- **Goal:** the page stops saying untrue things. **Why now:** highest embarrassment-per-minute-of-work ratio in the repo; also your first production edit — deliberately trivial.
- **Inspect:** `index.html:1788` ("via Recess.tv"), `:656` (stale comment), `:1644`/`T` keys `schedule.note` (2099, 2175) (June 2025 note), `:1806` (`max="2025"`), `:2056` (© 2025).
- **Run:** `grep -n "Recess\|2025" index.html` before and after.
- **Understand first:** why the label is wrong (F-01) and that the schedule-note text lives in *three* places (your first taste of finding 7).
- **May change:** delete the Recess.tv div + comment; update/remove the stale date note (all three copies); `max="2026"` or better `max="2100"`; © year. **Must not change:** the form's `action`/fields; testimonials (that's CP-5's decision).
- **Verify:** hard-refresh production in both languages; form still submits (one more test entry).
- **Commit:** `fix: remove incorrect form provider label and stale dates`. **Model:** Sonnet. **STOP:** not needed.

**CP-5 · School meeting #1 — content decisions** — no code session
- **Goal:** answers to D-11 (testimonials real?), D-15 (photo consent), D-13 (moms wording), D-01 (trial vs membership). **Why now:** they block CP-6/8 wording and the testimonial fix.
- Prepare with Prompt E (section 7); take the Swedish questions from section 8. **STOP:** this whole checkpoint *is* the stop. Apply the answers in a follow-up mini-session (`fix: update testimonials per school decision` or similar).

### Track C — Form you can trust

**CP-6 · Required fields + stable values + guardian clarity**
- **Goal:** every submission is complete and machine-readable. **Why now:** cheap now, and every future automation depends on clean values; do it *before* automation exists so no dirty data accumulates.
- **Inspect:** `index.html:1793–1841`; re-read F-03.
- **Run:** `grep -n "option\|required" index.html`
- **Understand first:** why `<option>` without `value` submits the *displayed label* (test it: switch to Chinese and submit — read what arrives).
- **May change:** add `required` (names, email, phone, class); `value="mini|junior|youth"` and `value="none|some|experienced"`; add a "Vårdnadshavarens namn" field; **delete** the birth-month and birth-day inputs (data minimization — doc 06 §2.2), keeping year only.
- **Must not change:** the `action` URL, the access key, visual styling.
- **Verify:** submit empty → browser blocks; submit in Chinese → email shows `klass: mini` not a label; year-only arrives.
- **Commit:** `fix(form): required fields, stable option values, guardian field, drop full DOB`. **Model:** Sonnet; ask Opus to *review* the field list if unsure. **STOP:** if the school wants full DOB kept — that's a D-01/D-02 conversation, not your call alone.

**CP-7 · Spam guard + a real thank-you page**
- **Goal:** bots filtered; applicants land on your own bilingual "tack / 谢谢" page. **Why now:** completes the trustworthy-form milestone; `tack.html` later becomes the hook for measuring submissions.
- **Inspect:** Web3Forms current docs for `botcheck` honeypot, hCaptcha, and `redirect` (their features move — read *their* docs, not this file's memory of them).
- **May change:** hidden honeypot input; hCaptcha widget if the docs' current method is simple; hidden `redirect` field; new `tack.html` (reuse the site's header/colors, both languages).
- **Must not change:** anything else on the page.
- **Verify:** real submission → email arrives AND browser lands on `https://wenxiantaekwondo.se/tack.html`; honeypot-filled submission (edit DOM in devtools) → no email.
- **Commit:** `feat(form): spam protection and bilingual thank-you page`. **Model:** Sonnet. **STOP:** if hCaptcha requires keys/config you don't understand — ship honeypot+redirect alone and ask Opus about captcha separately.

**CP-8 · Privacy page + consent checkbox** *(needs CP-5 answers)*
- **Goal:** the form is honest about data. **May change:** `integritet.html` (sv/zh: what/why/who/how long/rights/contact), required consent checkbox linking to it. **Must not change:** data collected (already minimized in CP-6).
- **Verify:** cannot submit unchecked; notice names Web3Forms truthfully and states the D-08 retention answer.
- **Commit:** `feat: privacy notice and guardian consent (GDPR)`. **Model:** **Opus** for drafting/reviewing the notice text (use Prompt D); Sonnet for the markup. **STOP:** before publishing, the notice text gets a human read-through by the board/instructor — AI drafts, humans own legal text.

### Track D — Performance and mobile (users feel these)

**CP-9 · Delete the four unused videos**
- **Goal:** −38.7 MB of dead weight. **Inspect/Run:** `grep -c "IMG_1919\|IMG_6989\|IMG_8698\|sd1731302124" index.html` → must print `0` (the *entire* justification). Copy the files somewhere safe outside the repo first.
- **May change:** `git rm` the four `.mp4` files. **Must not change:** the 17 referenced images; git history (D-19 stays deferred).
- **Verify:** site renders; videos section still plays (it uses YouTube).
- **Commit:** `chore: remove unreferenced video files (38.7 MB)`. **Model:** none needed. **STOP:** if any grep count is not 0, stop and investigate.

**CP-10 · Resize images to what the page actually shows**
- **Goal:** ~60 MB → under 5 MB per full visit. **Why now:** biggest user-facing win available.
- **Understand first:** the gallery `<img>`s load originals and merely *display* them small (F-07) — resizing serves everyone the same picture, faster.
- **Run (example, macOS built-in):** `mkdir -p assets/img && for f in *.jpeg *.jpg; do sips --resampleWidth 1600 "$f" --out "assets/img/$f"; done` — then compare quality by eye before switching references.
- **May change:** image references in `index.html` → `assets/img/…`; replace `huvudtränare.jpeg` with an ~800 px `assets/img/instructor.jpg` (ASCII name). **Must not change:** which photos appear; the modal behavior (`mediaItems` paths must be updated in step — remember finding 9's twin lists!).
- **Verify:** DevTools → Network → hard reload → total transferred < 5 MB; every gallery item opens in the modal (this catches a missed `mediaItems` path).
- **Commit:** `perf: serve web-sized images (~60MB → <5MB per visit)`. **Model:** Sonnet. **STOP:** if unsure whether the modal should show high-res originals — small decision, but ask yourself/the school once (doc 05 A.4 step 4).

**CP-11 · Mobile navigation**
- **Goal:** phones get a menu. **Inspect:** `index.html:1159–1180` (the MOBILE block), the nav markup at 1345–1355.
- **Understand first:** why `display:none` was the template's lazy answer, and what the *minimal* hamburger is (a button toggling one class; ~10 lines JS + ~15 lines CSS — resist anything fancier).
- **May change:** nav markup + MOBILE CSS + tiny toggle script. **Must not change:** desktop nav appearance.
- **Verify:** on a real phone (not only devtools): menu opens, links scroll, menu closes on selection, language button still reachable.
- **Commit:** `fix(mobile): add hamburger navigation`. **Model:** Sonnet; Opus if you want a mentored design discussion first. **STOP:** not needed.

**CP-12 · Head metadata + accessibility quick wins**
- **Goal:** decent search/share previews; the form works with screen readers; gallery works by keyboard. **May change:** meta description, OG tags, favicon; `for`/`id` on every label/input pair; gallery cards → real `<a href="assets/img/…">` that JS upgrades to the modal (progressive enhancement — doc 02). **Must not change:** visual design.
- **Verify:** Tab through the whole page — every interactive element reachable and visibly focused; a link-preview checker shows title+description+image.
- **Commit:** `feat: head metadata; a11y: label association and keyboard-accessible gallery`. **Model:** Sonnet. **STOP:** not needed.

### Track E — Structure (the refactor, only now)

**CP-13 · Extract CSS + un-embed the hero image** — follow `05-recommended-architecture.md` A.4 step 1 exactly. Commit: `refactor: extract CSS to css/ and un-embed hero image (no visual change)`. **Model:** Sonnet executes; the plan is already written. **STOP:** if any visual diff appears that you can't explain — revert, investigate, retry.

**CP-14 · Extract JS to four files** — A.4 step 2. Verify language toggle persistence, modal keys/back-button, fade-ins. Commit: `refactor: extract JS modules (no behavior change)`. **Model:** Sonnet. **STOP:** not needed if verification passes.

**CP-15 · Single source of truth for Swedish** — A.4 step 3: HTML becomes the sv authority; `T.sv` is deleted; `applyLang('sv')` restores cached defaults; the line-1937 drift dies here. This is the only *logic* change in the track. Commit: `refactor(i18n): single source of truth for Swedish text`. **Model:** **Opus** — it's subtle (`dataset` caching, `data-i18n-html` vs text nodes), and the mentoring conversation is the point. **STOP:** before starting, re-read doc 05's rationale and make sure you agree with HTML-as-authority; if you prefer dictionary-as-authority, that's a legitimate architecture decision — decide *consciously*, write one paragraph why, then implement your choice.

**CP-16 · Duplicated course-facts inventory** — read-only. **Goal:** list every place a class name/age/day appears (cards, schedule table, form options, `T.zh`) and decide whether any consolidation is *worth its cost* now that CP-15 halved the duplication. **Expected honest outcome:** "leave it; schedule changes are rare and the remaining duplication is visible and cheap" — writing that conclusion down **is** the deliverable (knowing when to stop is the lesson). Commit: none, or a note in the runbook. **Model:** Opus for the discussion. **STOP:** if tempted to build a data-driven schedule renderer — that's section 9 territory until schedule edits demonstrably hurt.

### Track F — Automation (Phase 2 of the roadmap; needs CP-5 school answers D-03/D-04)

**CP-17 · Design the applicant record** — no code. Create the Google Sheet with the columns from `03-business-workflow.md` §B.5; walk one imaginary family through all 9 states by hand, filling timestamps. **Model:** Opus to challenge your column design. **STOP:** confirm D-04 (mailbox) and D-16 (who gets Sheet access) before entering any real data.
**CP-18 · Intake script, dark-launched** — Apps Script `doPost` (validate + honeypot → append row → notify staff), tested via `curl` against the script URL; **the website's form is not switched yet**. Keep the script's source in `apps-script/` in this repo. Commit: `feat(automation): applicant intake script (not yet live)`. **Model:** Opus for the first version + security review (Prompt C), Sonnet for iterations.
**CP-19 · Go live + bilingual acknowledgement** — switch the form `action` (one attribute), ack email in sv+zh, Web3Forms documented in the runbook as instant fallback. Verify with a real end-to-end application. Commit: `feat(automation): form live against intake script with auto-acknowledgement`. **STOP:** watch the first week of real submissions before building anything more (reminders are Phase 3 / a later checkpoint set).

---

## 5. Phase 0 — baseline and safety checklist (run before ANY code change)

```text
□ cd ~/Documents/projects/Others/跆拳道网站/wenxiantaekwondo
□ git status                    → clean (or only known docs)? if not: stop, understand why
□ git branch --show-current    → main (remember: pushing main = deploying production)
□ git log --oneline -3         → matches what you expect? tag v1-baseline exists? (git tag)
□ Production check: open https://wenxiantaekwondo.se — hero loads, toggle 中文/Svenska,
  open one photo + one video in the modal, on desktop AND a phone
□ Form check: send a "TEST — radera" application → email arrives in the inbox (note: minutes?)
□ Provider facts: Web3Forms (NOT Recess.tv) — key is public-by-design; plan + delivery
  address as recorded in docs/runbook.md
□ Domain/DNS: domain at Loopia; CNAME file says wenxiantaekwondo.se; Pages settings =
  deploy from main /root; HTTPS enforced. Don't touch any of it.
□ Screenshots (if not already in docs/): 375/768/1280 px, both languages, all sections
□ Rollback plan known: git revert <commit> for one step; git reset --hard v1-baseline
  + push for catastrophe (understand what that does BEFORE you need it)
□ Allowed to change this session: exactly what the current checkpoint lists
□ Forbidden always (without an explicit checkpoint saying otherwise):
  CNAME · form action URL/access key · git history rewrite · deleting referenced media ·
  Pages/DNS settings · anything in docs/architecture-review/ except this file's checkboxes
```

---

## 6. Model usage strategy

- **Use Opus (or the strongest available) when the cost of a wrong decision is high and the work is judgment:** architecture choices (CP-15's authority question, CP-17's record design), security/GDPR review (Prompts C/D), the first version of anything that receives untrusted input (CP-18), and post-mortems when something broke and you don't know why.
- **Use Sonnet for well-specified execution:** mechanical edits with a written plan (CP-4, 6, 7, 9–14), explaining code you're reading, writing verification steps, drafting commit messages. Most checkpoints above are deliberately Sonnet-shaped: the thinking was done in the review; the session just executes and verifies.
- **Use a cheaper/faster model (Haiku-class) for:** syntax questions, "what does this CSS property do", command-line one-liners, translating your own drafts between sv/zh/en.
- **Don't ask AI to code when:** the blocker is a decision (section 8 — a model will happily invent an answer), when you haven't run the failing thing yourself yet, or when you couldn't review the output (if you can't judge it, you can't own it — shrink the task until you can).
- **Ask AI for review only (no editing)** before every deploy of tracks C–F (Prompt C) and on every staged diff (Prompt F). Review-only mode is also how you learn fastest: you write, it critiques.
- **Ask the school/instructor instead of AI for:** everything in section 8, anything touching money, anything publishing a person's name or image, and the consent/privacy texts' final wording. AI prepares the question; humans answer it.

---

## 7. Reusable prompt templates

**Prompt A — Read and explain only**
```text
You are my senior mentor. Repo: ~/Documents/projects/Others/跆拳道网站/wenxiantaekwondo
(production taekwondo-club site; context in docs/architecture-review/, esp. 00 and 01).

READ-ONLY session: do not edit, create, or stage anything.

Explain <FILE or FEATURE, e.g. "the media modal, index.html lines 2279–2381">:
1. What it does, in plain language first.
2. Walk the code top-to-bottom; name each concept as it appears.
3. What is well done and why. What is fragile and what exact input breaks it.
4. What a beginner typically misunderstands here.
5. Three questions to test whether I understood — ask, then wait for my answers
   and correct them.
```

**Prompt B — Small refactor with mentoring**
```text
You are my pair-programming mentor. Repo: ~/Documents/projects/Others/跆拳道网站/wenxiantaekwondo
This is PRODUCTION (GitHub Pages deploys from main). Read docs/architecture-review/00-learning-master-plan.md
— we are doing checkpoint <CP-N> and nothing else.

Process, strictly in order:
1. PROPOSE: one small change only — Observation / Why it matters / Learning concept /
   Smallest safe change / Files affected / Step-by-step plan / Manual verification /
   Suggested commit message / What not to change yet.
2. WAIT for my explicit "go".
3. IMPLEMENT exactly the agreed plan; flag any surprise instead of improvising.
4. VERIFY: run the checks; show me evidence, not assurances.
Refuse scope creep, including mine: if I ask for more mid-session, remind me it's
the next checkpoint.
```

**Prompt C — Production safety review**
```text
Act as a skeptical release reviewer for a live site (wenxiantaekwondo.se, GitHub Pages
from main, real applicants including children — see docs/architecture-review/06).

Review the currently uncommitted/staged changes (git diff + git diff --staged). Do not edit.
Answer:
1. What exactly changes for a visitor? (desktop + mobile, sv + zh, with and without JS)
2. What could this break? Rank by likelihood × damage.
3. Does anything touch the form pipeline, personal data, or third-party endpoints?
4. Rollback: is one git revert enough? If not, say why and what to do instead.
5. Verification checklist I must run on production after deploy.
Verdict: SHIP / SHIP WITH CHECKS / DO NOT SHIP — and the single most important reason.
```

**Prompt D — GDPR / children's data review**
```text
Practical privacy review, NOT legal advice. Context: Swedish ideell förening; the form
collects data about children; docs/architecture-review/06-gdpr-security.md has the baseline.

Review <CHANGE or FILE>. For each issue: what data is involved → is it needed for the
stated purpose (data minimization) → who can access it and where does it flow (name every
third party) → retention → what the privacy notice must say about it → severity
(urgent / recommended / needs-board-confirmation ⚖️).
Mask any sensitive values in your answer. End with: the single smallest change with the
biggest privacy improvement, and any question that must go to the board rather than to me.
```

**Prompt E — Business decision preparation**
```text
Help me prepare a short meeting with the taekwondo instructor (non-technical, busy;
Swedish; some questions may be asked in Chinese). Input: docs/architecture-review/08-decision-log.md
items <D-xx, D-yy> and section 8 of 00-learning-master-plan.md.

For each decision: 1) the question in ONE plain-Swedish sentence, no tech words;
2) why it matters to the school in one sentence (families, money, or trust — not code);
3) my recommended default and what happens if we just pick it; 4) what their answer
changes in the plan. Order by "most consequential first". Fit everything on one page
I can bring on my phone.
```

**Prompt F — Commit review**
```text
Review my staged changes before I commit (git diff --staged). Read-only. Checkpoint
context: <CP-N> in docs/architecture-review/00-learning-master-plan.md.

1. Does the diff do exactly what the checkpoint allows — nothing more, nothing less?
   List anything out of scope.
2. Any accidental changes (whitespace churn, renamed files, touched lines I didn't mean)?
3. Is it ONE logical change? If not, how to split it (git add -p guidance is fine to
   describe, not to run).
4. Propose the commit message: conventional prefix, imperative, honest about impact.
5. What manual check must pass BEFORE this commit and what on production AFTER push?
```

---

## 8. Decision questions for the school

*(Full context per ID in `08-decision-log.md`. Swedish phrasing ready to use; record answers there.)*

**Must ask before content changes** *(blocks CP-5 → CP-4-follow-up)*
- **D-11:** "Är personerna i omdömena på hemsidan riktiga personer, och har de godkänt att vi visar deras namn?" *(if not: replace with real, consented quotes or remove)*
- **D-15:** "Har vi skriftligt godkännande från vårdnadshavarna för alla barn som syns på bilderna på hemsidan?"
- **D-13:** "Ska det stå 'inkl. moms' på terminsavgiften — är föreningen ens momspliktig för medlemsavgifter?" *(ask the treasurer)*

**Must ask before form changes** *(blocks CP-8)*
- **D-01:** "Är formuläret en intresseanmälan för en gratis provlektion, eller en riktig medlemsansökan?"
- **D-02:** "Är styrelsen medveten om att föreningen (org.nr 802521-1049) är personuppgiftsansvarig för det som skickas in via hemsidan?"
- **D-08:** "Hur länge ska vi spara uppgifter om familjer som inte blir medlemmar? Mitt förslag: 6 månader, sedan raderas de."

**Must ask before automation** *(blocks CP-17–19)*
- **D-03:** "Vem ansvarar för att svara på nya anmälningar — och vem är backup vid semester eller sjukdom?"
- **D-04:** "Vilken e-postadress ska ta emot anmälningar och skicka automatiska bekräftelser? (En klubbadress, inte en privat.)"
- **D-16:** "Vilka personer ska kunna se listan över sökande?" · **D-17:** "Ska automatiska mejl gå ut på både svenska och kinesiska?" *(default: yes, both in one email)*

**Must ask before payment** *(blocks CP after Phase 3 / roadmap Phase 4 — start the bank question EARLY, it takes weeks)*
- **D-09:** "Kan vi skaffa Swish Företag via föreningens bank, och vem i styrelsen kan skriva under avtalet?"
- **D-10:** "Får man träna innan terminsavgiften är betald — och i så fall hur många pass?"
- **D-12:** "Är avgiften alltid 1 700 kr per termin? Syskonrabatt? Halv termin vid start mitt i?"
- **D-14:** "Är föreningen beredd att betala ca 100–300 kr/månad för ett medlemssystem om det sparar kassörens tid? (Kolla också om Svenska Taekwondoförbundet har något rabattavtal.)"

**Can wait** — D-05 (exact trial date on site? default no), D-06 (approval before booking), D-07 (what counts as attendance), D-18 ("hur hittade ni oss?"-field, default yes), D-19 (git history cleanup).

---

## 9. What not to do yet

| Not yet | Why postponing is *good engineering* | Revisit when |
|---|---|---|
| **Full custom backend / API / admin app** (Option C/D) | You'd become sole operator of an authenticated system holding children's data — highest security burden in doc 04 for a problem a shared spreadsheet solves. Building it teaches you plenty; *operating* it teaches the school to depend on one volunteer. | Applications >100/month or a second committed maintainer exists. Portfolio itch → build it on fake data in a separate repo. |
| **React / framework rewrite** | Zero product requirement points at it (one language flag + one modal is all the state there is). It would add a build pipeline and dependency churn to a volunteer project and slow the page. Restraint here *is* the architecture skill. | The site becomes a genuine app (member login, interactive booking) — which the plan routes to a platform instead anyway. |
| **User accounts / login** | Auth is the single most dangerous thing to hand-roll. Nothing on the site needs identity; the Sheet's Google sharing covers staff access. | Never on this codebase; a club platform brings it if needed. |
| **Payment processing before applicant tracking works** | Automating stage 10 while stages 3–9 leak is pipeline-backwards: you'd collect money reliably from families you lose track of beforehand. Doc 03 ranks the leaks; fix in leak order. | Phase 2–3 running smoothly for a full termin. |
| **A database before the workflow is understood** | Schema is frozen assumptions. The Sheet *is* the schema-discovery phase — every column you add/rename there for free would be a migration in Postgres. | The Sheet demonstrably strains (concurrent edits, >1–2k rows, access-control needs). |
| **A data-driven schedule/translation build system** | CP-15 removes half the duplication for ~50 lines. A generator would trade visible, cheap duplication for an invisible toolchain — negative return at 4 classes and 2 languages (CP-16 exists to write this conclusion down consciously). | Schedule edits become frequent AND error-prone in practice, or a third language actually lands. |
| **Analytics / tracking scripts** | No decision this club makes needs page views (doc 07 metrics table); adding a tracker buys consent complexity for a vanity number. Applications are the real signal, and Phase 2 counts them. | A concrete question arises that submission data can't answer. |
| **Git history rewrite (D-19)** | Rewriting a live repo's history breaks every clone; 144 MB is annoying, not harmful. Do it, if ever, as a deliberate coordinated act after the media work settles. | Clone time actually blocks someone. |

---

## 10. Next recommended session

- **Do:** Checkpoint CP-1, then CP-2 in the same sitting if energy remains (both are low-risk by design).
- **Open first:** `docs/architecture-review/01-current-state.md` — side by side with `index.html`.
- **Run first:** `cd ~/Documents/projects/Others/跆拳道网站/wenxiantaekwondo && git status && grep -n "Recess" index.html`
- **Answer first (write it down in one sentence each):** *"Where does a submitted application actually go, and what does the applicant see afterwards?"* — if you can answer from memory with file/line evidence, CP-1 is done.
- **Smallest useful commit:** `docs: add architecture review and learning plan` followed by `git tag v1-baseline && git push origin main --tags` — after that, every future step has a floor to fall back to.
- **Then book the CP-5 school meeting** (section 8, first two groups) — its answers gate more checkpoints than anything else on the list, and it needs zero code.

*When CP-1/CP-2 are done, mark them ✅ at the top of section 4 — keeping this file honest is part of the practice.*
