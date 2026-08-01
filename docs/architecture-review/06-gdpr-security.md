# 06 — GDPR, Children's Data, and Security Review

> **Not legal advice** — a practical engineering review. Items needing legal/organizational confirmation are marked ⚖️ and mirrored in doc 08.
> Secrets policy: values are masked; nothing sensitive is reproduced here.

---

## 1. What the repository actually exposes (inspection results)

| Item | Where | Assessment |
|---|---|---|
| Web3Forms access key `935c…ab0f` (masked) | `index.html:1791`, present since commit `1fdb92a` | **Public by design** — Web3Forms keys are meant to be client-side. Not a leak. Consequence: anyone can submit to your inbox through it → spam controls below. Can be rotated in the Web3Forms dashboard if abuse ever starts. |
| API keys / tokens / passwords | full history scanned (`git grep` across all commits for key/secret/password/token patterns) | **None found.** |
| Personal data in the repo | phone `+46 738 430 096`, mail `wenxiantaekwondo@outlook.com`, org.nr, address (contact section); instructor name/photo/bio; **gallery photos likely showing minors** (1.jpeg–16.jpg); testimonial names (`index.html:1930–1953`) | Contact/org data: intentional and fine. Photos of children: ⚖️ consent needed (see §4). Testimonial names: ⚖️ real-with-consent or remove (doc 01 F-08). |
| Unsafe client-side trust | no validation anywhere; select values = display labels | Data-quality issue (doc 01 F-03); no injection risk on a static site, but everything arriving by form must be treated as untrusted text in Phase 2 (don't `eval`, don't render as HTML in the Sheet/emails). |

## 2. Urgent items (do in Phase 1)

1. **No privacy notice, no consent, while collecting children's data.** The form takes name + full DOB + contact of applicants explicitly as young as 5 (`index.html:1443`), with no notice of purpose, storage, recipients, or rights, and no consent checkbox (verified on production). GDPR Art. 13 information duty applies at the point of collection; IMY (the Swedish DPA) treats children's data as requiring extra care. **Fix:** `integritet.html` (sv/zh) stating: what is collected, why (arrange a trial lesson), who receives it (the club; Web3Forms as processor — *currently the page names the wrong company entirely*, F-01), how long (see §5), and how to request deletion (mail the club). Consent checkbox for guardians: *"Jag är vårdnadshavare och godkänner att uppgifterna används för att kontakta oss om en provlektion / 本人是监护人，同意上述信息用于联系试课事宜"* + link. ⚖️ exact lawful basis (consent vs. legitimate interest for handling an inquiry the family initiated) — worth a check via RF-SISU's free club counseling; the *engineering* work is identical either way.
2. **Data minimization — drop the full birth date.** A trial booking needs age/class fit, nothing more. Birth **year** alone (or the class dropdown alone) suffices; full DOB of a child is needlessly sensitive to pipe through a US form vendor and an inbox. Fix: delete `birthmonth`/`birthday` inputs (`index.html:1807–1808`). Full personnummer/DOB can be collected *at membership registration* through the eventual platform, where it's actually needed (STF licensing/insurance ❓).
3. **Spam/bot exposure:** public endpoint + no honeypot/captcha (doc 05 A.4 step 5). Web3Forms provides both; enable them. Rate limiting is Web3Forms' concern (their infrastructure) — acceptable.
4. **Guardian vs. child identity is ambiguous:** one name field, one email, one phone — whose? For minors you want *guardian* contact explicitly. Add "Vårdnadshavarens namn" when the class is a child class (or always; simpler). Cheap fix, large clarity gain — also fixes doc 03's matching problems.

## 3. Recommended improvements (Phase 1–2)

- **Email-as-database:** today the only record of applicants is an inbox ❓ (assumed `…@outlook.com`, consumer account). Consequences: no access control granularity, no retention policy, no audit, hard deletion (GDPR erasure across a mail thread is miserable). Phase 2's Sheet becomes the *system of record*; then define the inbox as transient (delete forwarded applications after transfer, or set auto-archive). ⚖️ Decide the official mailbox (D-04) — a club-owned mailbox, not a personal one.
- **Spreadsheet access control (Phase 2):** share the Sheet to named accounts only (instructor + maintainer), no link-sharing; 2FA on those Google accounts; the Apps Script runs as the owner — the form public never touches the Sheet directly. Audit trail: Sheets version history + the append-only notes column (doc 03 B.3) is honest, adequate audit for this scale.
- **Backups (Phase 5):** monthly Sheet export (File → Download → xlsx) into a private club drive folder. Website itself is inherently backed up (git).
- **Third-party loads on page view:** Google Fonts (`index.html:7`) transmits visitor IPs to Google — a known EU compliance irritant (German case law); fix by self-hosting the three font files (also faster). Google Maps iframe (2010) and YouTube *thumbnails* (1733–1745) load third-party content pre-consent; embeds already use `youtube-nocookie` (good). Pragmatic step: self-host fonts + make the map click-to-load; thumbnails are tolerable, or proxy them into `assets/`. Severity: low-medium; standard practice for small sites is imperfect here — improve opportunistically, don't panic.
- **`localStorage('lang')`** (2216–2220): functional preference, no tracking — fine without a banner; mention it in the privacy page for completeness. **No analytics exist** — when adding metrics later, prefer server-side counting (the Sheet) or a cookieless counter over Google Analytics, keeping the site banner-free.
- **Data location/subprocessors:** Web3Forms (US-based ❓ — verify their DPA/data-location page), Google (EU region configurable in Workspace; consumer accounts less so ❓), GitHub Pages (US; but it hosts only *public content*, no applicant data — fine). List whichever set survives Phase 2 decisions in `integritet.html`.

## 4. Questions requiring legal/organizational confirmation ⚖️ (mirrored in doc 08)

1. Who is **data controller** (personuppgiftsansvarig)? Presumably the förening as legal entity (org.nr 802521-1049) — needs board acknowledgment (D-02).
2. **Photo consent** for every recognizable person, especially minors, in 1.jpeg–16.jpg and any future gallery additions — obtain/confirm written guardian consent or replace images (D-15).
3. **Testimonials**: real people with consent, or remove/replace with clearly-labeled anonymized quotes (D-11; also marketing-law angle, doc 01 F-08).
4. **Retention** (D-08). Proposed defaults to ratify: non-converted applicants (DECLINED/LOST) — delete/anonymize after **6 months**; members — for the duration of membership + what bookkeeping law requires for payment records (bokföringslagen: 7 years for accounting material — payments yes, trial applications no ❓ treasurer confirms).
5. **Insurance/förbund requirements** on member data (STF licensing) ❓ — determines what the *membership* record must eventually hold (feeds the platform choice, doc 04 B).

## 5. Summary risk table

| Risk | Today | After Phase 1 | After Phase 2 |
|---|---|---|---|
| Child DOB over-collection | High | Removed (year only) | — |
| No notice/consent | High | Notice + checkbox live | — |
| Wrong processor named on page | High (F-01) | Fixed | — |
| Spam/junk into inbox | Medium | Honeypot+captcha | + validation in script |
| Email-as-database | Medium | unchanged | Sheet = record; inbox transient |
| Access control on records | Weak (inbox ❓) | unchanged | Named accounts + 2FA |
| Retention undefined | High (indefinite) | Policy written | Enforced by routine |
| Secrets in repo | None ✅ | — | keep it that way: the Apps Script URL is public-safe; any future API keys live in Script Properties, never in this repo |
