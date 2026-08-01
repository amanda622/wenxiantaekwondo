# 01 — Current-State Repository Analysis

> Reviewed: 2026-07-13 · Repo `main` @ `45c9c91` · Verified identical to production at https://wenxiantaekwondo.se/
> Every finding below cites a file and line range. Severity: **low / medium / high**. Action: **now / later / not at all**.

---

## 1. Directory and file structure

```text
wenxiantaekwondo/
├── CNAME                    # "wenxiantaekwondo.se" — custom-domain binding for GitHub Pages
├── index.html               # 2,383 lines / 237 KB — the entire application
├── 1.jpeg … 9.jpeg          # gallery photos (0.3 – 4.8 MB each)
├── 10.jpg … 16.jpg          # gallery photos (0.5 – 6.7 MB each)
├── jacky_zhang_cover.jpg    # about-section image (340 KB, used)
├── huvudtränare.jpeg        # instructor photo (14 MB, used — see F-07)
├── IMG_1919.mp4             # 14.7 MB — NOT referenced anywhere (see F-06)
├── IMG_6989.mp4             # 11.7 MB — NOT referenced
├── IMG_8698.mp4             #  0.7 MB — NOT referenced
└── sd1731302124_2.mp4       # 11.6 MB — NOT referenced
```

- No `README`, no `LICENSE`, no `.gitignore`, no `robots.txt`, no favicon, no `404.html`, no privacy page.
- Working tree: 240 MB total, of which `.git` is 144 MB (history also contains deleted `IMG_*.mov`, `IMG_8870.jpeg`, `jacky_zhang.jpg`).
- **Everything the site is, lives in one file.** That is not automatically wrong for a one-page site — the review below separates the parts of this that actually hurt from the parts that are fine.

## 2. Responsibilities currently inside `index.html`

| Lines | What it is | Approx. size |
|---|---|---|
| 1–7 | Head: charset, viewport, title, Google Fonts link | 7 lines |
| 8–1340 | **All CSS** — design tokens (`:root`, 9–21), then per-section blocks with comments: NAV (34), HERO (87), ABOUT (305), CLASSES (396), SCHEDULE (494), REGISTRATION (553), PRICING (741), INSTRUCTORS (879), TESTIMONIALS (954), CONTACT (1019), FOOTER (1088), SCROLL ANIMATIONS (1148), MOBILE (1159), media cards/modal (1184+) | ~1,330 lines; **line 132 alone holds a ~140 KB base64 JPEG** (hero background) — ~60 % of the file's bytes |
| 1342–2059 | **All HTML content**: nav (1345), hero (1358), about (1394), classes (1432), schedule table (1524), gallery — 16 repeated cards (1650), videos — 4 YouTube cards (1725), registration form (1752), pricing (1848), instructor (1889), testimonials (1917), contact + map (1961), org banner (2024), footer (2045) | ~720 lines |
| 2060–2243 | **Script 1**: translation dictionary `T` (sv: 2062–2137, zh: 2138–2213), `applyLang` / `toggleLang`, `localStorage` persistence | ~185 lines |
| 2244–2262 | **Script 2**: `IntersectionObserver` fade-ins + smooth anchor scrolling | ~19 lines |
| 2265–2277 | Media-modal markup (placed after the scripts) | 13 lines |
| 2279–2381 | **Script 3**: `mediaItems` array (2280–2301) + modal open/close/navigate logic with `history.pushState` back-button handling | ~100 lines |

## 3. Approximate division of concerns

| Concern | Where | Share of file |
|---|---|---|
| CSS (incl. embedded image) | 8–1340 | ~56 % of lines, ~75 % of bytes |
| HTML content | 1342–2059 | ~30 % |
| Translation data | `T` dict 2061–2214 **plus** duplicated Swedish defaults inline in HTML | ~7 % (but see F-02) |
| Form logic | none in JS — pure native `<form method="POST">` to Web3Forms (1790–1841) | ~2 % |
| Gallery/video logic | HTML cards 1650–1749 + modal JS 2279–2381 | ~7 % |
| Third-party integrations | Google Fonts (7), Web3Forms (1790), YouTube thumbs (1733–1745) + `youtube-nocookie` embeds (2337), Google Maps iframe (2010–2014) | scattered |

## 4. Findings

### F-01 · Form header claims the wrong provider — **high · fix now**
- **Evidence:** `index.html:1788` renders `<div class="reg-powered">via Recess.tv</div>`, but the form action is `https://api.web3forms.com/submit` (`index.html:1790`). A stale CSS comment confirms an abandoned plan: `/* Simple inline form (replace iframe src with real Recess.tv link) */` (`index.html:656`). Confirmed visible on production.
- **Consequence:** The site tells applicants their personal data goes to a company that never receives it, and hides the one that does. Under GDPR you must name where data goes; this label is actively wrong. It also looks unprofessional to anyone who checks.
- **How to spot this pattern yourself:** whenever visible text names a third party, grep the code for that party's domain. If the name and the network endpoint disagree, one of them is stale.

### F-02 · Every Swedish string exists twice, and they have already drifted — **medium · fix later (with the Level-1 split)**
- **Evidence:** ~130 keys exist both as inline HTML defaults and in `T.sv` (2062–2137). Drift examples: `index.html:1937` hard-codes the *Chinese* testimonial text as the pre-JavaScript default while `T.sv['test2.text']` (2127) holds the Swedish version; `index.html:1369` defaults `hero.cn` to `文 贤 跆 拳 道 协 会` while `T.sv['hero.cn']` (2065) is `'WenXian Taekwondo'`.
- **Consequence:** Every copy change must be made in two places; before JavaScript runs (or if it fails), users see whichever version happens to be in the HTML — currently a mix of languages.
- **Severity note:** this is the classic **DRY** violation that actually bites, because the two copies have *already* diverged — it is not theoretical.

### F-03 · The form accepts anything, from anyone — **high · fix now**
- **Evidence:** zero `required` attributes in the whole file (`grep -c required index.html` → 0); fields at 1796–1835. No honeypot field, no captcha (Web3Forms supports both). `<option>` elements have no `value` attributes (1822–1834), so the submitted value is the *currently displayed label* — a Chinese-mode user submits `klass = "儿童基础班 (5–7岁)"`, a Swedish-mode user `"Mini Klass (5–7 år)"`.
- **Consequence:** (a) empty or junk applications reach the instructor's inbox; (b) bots can spam the endpoint (the access key is public by design — see doc 06); (c) the same class arrives under two different names, which will sabotage any future automation or statistics before it starts.

### F-04 · No confirmation for the applicant, and a promise the system can't keep — **high · fix now (partially), rest in Phase 2**
- **Evidence:** no `redirect` hidden field → after submitting, the visitor lands on Web3Forms' generic English success page, off-site. No auto-acknowledgement email is configured in the repo. Meanwhile the page promises "vi kontaktar dig inom 24 timmar" (`index.html:1758`, `T` 2103/2179).
- **Consequence:** the applicant gets no branded, bilingual confirmation and no copy of what they sent; the 24-hour promise depends entirely on a human reading an inbox. This is the single biggest funnel leak (doc 03).

### F-05 · Mobile visitors get no navigation at all — **high · fix now**
- **Evidence:** `@media (max-width: 900px) { .nav-links { display: none; } }` (`index.html:1162`) — and no hamburger/toggle exists anywhere (grep for `burger|menu-toggle|nav-toggle` → nothing).
- **Consequence:** on phones — where most Google-Maps traffic arrives — the menu and the nav "Anmäl dig" CTA vanish. Users can still scroll to the form via the hero button, but jump navigation, and a persistent register CTA, are gone exactly on the device class that matters most.

### F-06 · 38.7 MB of media is dead weight — **medium · fix now (cheap and safe)**
- **Evidence:** `IMG_1919.mp4`, `IMG_6989.mp4`, `IMG_8698.mp4`, `sd1731302124_2.mp4` have **zero references** in `index.html`; the video section uses YouTube IDs (`mediaItems`, 2297–2300). Git history additionally carries deleted `.mov` originals — `.git` alone is 144 MB.
- **Consequence:** every clone downloads ~150+ MB for a one-page site; GitHub Pages deploys carry it too. No user-facing harm, but real contributor/deploy friction.

### F-07 · Used images are 10–40× larger than needed — **high · fix now**
- **Evidence:** `huvudtränare.jpeg` is **14 MB** and is rendered in a 240 px-wide card (`index.html:1898`); gallery thumbnails load the full originals (`<img src="10.jpg">` = 6.7 MB, `14.jpg` = 6.7 MB, `11.jpg` = 5.9 MB; 1657–1720) and merely crop them with CSS `aspect-ratio`/`object-fit`. `loading="lazy"` delays but does not shrink the transfer. A full scroll of the page transfers roughly 60 MB.
- **Consequence:** slow first impression on mobile data, needless GitHub bandwidth, poor Lighthouse/SEO scores. Also `huvudtränare.jpeg` contains a non-ASCII character (`ä`) — it works today, but URL-encoding of filenames is a classic source of subtle breakage; prefer ASCII names.

### F-08 · Testimonials reference classes that don't exist — **medium · fix now (confirm first)**
- **Evidence:** roles "Förälder · Mini Tigers" (`index.html:1931`), "家长 · Junior Warriors" (1942), "Elev · Adult Masters" (1953) — no class by any of these names exists on the site (classes are Mini/Junior/Ungdom & Vuxen/Tävlingsklass, renamed in commits `c925f57`, `45c9c91`). The names look like leftovers from the original template iteration.
- **Consequence:** if these are template placeholders rather than real people, they are fabricated reviews — a problem under Swedish marketing law (marknadsföringslagen) and a trust risk. If they are real, their roles are stale and using their names requires consent. **Needs confirmation from the school** (decision log D-11).

### F-09 · Stale hard-coded dates and facts — **low · fix now (one-line edits)**
- **Evidence:** "Giltig fr.o.m. 2 juni 2025" (`index.html:1644`, `T` 2099/2175) — over a year old; `© 2025` (2056); birth-year `max="2025"` (1806); hero says "100+ Aktiva elever" (1383) while the about text says "nära hundra" (1404).
- **Consequence:** small individually, but they signal an unmaintained site, and the birth-year cap silently rejects children born in 2026.

### F-10 · Placeholder social links and a hand-edited map embed — **low–medium · fix now**
- **Evidence:** three social icons all `href="#"` (`index.html:2001–2003`); the Google Maps iframe URL (2010–2014) has hand-edited parameters ending `!4v1234567890` with generic coordinates (`57°39'N 11°54'E`).
- **Consequence:** dead links on production; the map pin may not match the actual Google Business listing at Gruvgatan 14 — verify by loading the page and comparing with the Maps listing, then regenerate the embed from Google Maps → Share → Embed.

### F-11 · Missing head metadata — **medium · fix now**
- **Evidence:** no `<meta name="description">`, no Open Graph/Twitter tags, no favicon, no canonical URL, no LocalBusiness structured data (grep for `favicon|description|og:` → nothing between lines 1–7).
- **Consequence:** search snippets and link previews (WeChat/WhatsApp/Facebook shares — important for both target communities) are auto-generated and ugly; a small but real recruitment-funnel cost given discovery happens via Google.

### F-12 · Accessibility gaps — **medium · fix now (cheap) / later (modal focus)**
- **Evidence:** form labels are not associated with inputs — no `for`/`id` pairs (1795–1836); gallery cards are click-only `<div onclick>` with no `tabindex`/`role`/keyboard handler (1657–1720); all content images have `alt=""` (1658 etc.); modal close/nav buttons *do* have `aria-label` (2266–2269) but there is no focus trap.
- **Consequence:** screen-reader users can't tell which label belongs to which field on the one form the business depends on; keyboard users cannot open the gallery at all.

### F-13 · "inkl. moms" on membership pricing — **low · confirm with the association**
- **Evidence:** "per termin · inkl. moms" (`index.html:1877`, `T` 2120/2196).
- **Consequence:** a Swedish ideell förening's membership/training fees are normally VAT-exempt; stating "incl. VAT" may be simply wrong and could confuse bookkeeping. Not a code issue — a wording/accounting question (decision log D-13).

## 5. What is tightly coupled

- **Content ↔ translation system:** every visible string is coupled to a `data-i18n` key *and* duplicated inline (F-02). Changing copy = touching two places in one 2,383-line file.
- **Gallery HTML ↔ `mediaItems` JS:** adding photo #17 requires a new 4-line HTML card (with the inline SVG repeated a 17th time) *and* a new array entry, in the right order — the modal's index-based navigation silently misbehaves if they disagree (1657–1720 vs 2280–2301).
- **Schedule data ↔ three renderings:** class names/ages/days appear in the class cards (1441–1520), the schedule table (1534–1643), *and* the `T` dictionary — one schedule change means 3+ edits.
- **Design tokens are healthy:** colors are centralized in `:root` (9–21) — this part is well done. But ~60 elements bypass the CSS with `style="…"` attributes (e.g. sections 1650, 1725; instructor card 1896–1908; contact socials 2001–2003), which couples styling to markup and will make a stylesheet split slightly tedious.

## 6. Duplicated content (must be updated in several places)

| Content | Locations |
|---|---|
| Every Swedish string | inline HTML + `T.sv` |
| Class names/ages/days | class cards + schedule table + `T.sv` + `T.zh` + form `<option>` labels |
| Gallery item list | 16 HTML cards + `mediaItems` array |
| Phone number | 1840 (form note), 1981 (contact), `T` 2116/2192 |
| Card-icon SVG | repeated verbatim 16× (1659–1719) |
| "Giltig fr.o.m." note | 1644 + `T` 2099 + 2175 |

## 7. Features likely to become difficult to extend

- **Adding a third language** (e.g. English): the current `T` structure supports it, but the duplicated inline defaults and `zh-only` class hack (1909) don't generalize; also `lang-btn` is a two-state toggle (2240).
- **Changing the schedule**: three coupled renderings (above) — the most frequently changing content is the most duplicated.
- **Adding gallery items**: two coupled lists + manual SVG copy-paste.
- **Any workflow automation**: there is nothing to attach it to — no structured data leaves the form except an email; no thank-you URL to add tracking to; no stable machine-readable values (F-03).

## 8. Parts that are already perfectly acceptable — do not change without a concrete reason

- **The single-page format itself.** One page is the right shape for this site's content volume.
- **Design-token CSS variables** (`:root`, 9–21) and the section-commented CSS organization — genuinely tidy.
- **The `data-i18n` attribute mechanism** (2218–2238) — a clean, dependency-free i18n pattern; keep it, just move the dictionary out (doc 05).
- **The media modal** (2279–2381) — `history.pushState` back-button handling, Escape/arrow keys, `youtube-nocookie` embeds: thoughtful work, above template quality.
- **Native form POST** (no JS required to apply) — accidental but valuable progressive enhancement; preserve it in any refactor.
- **GitHub Pages + Loopia DNS + CNAME** — zero-cost, reliable hosting; no reason to move (doc 05 §5 covers when that changes).

## 9. Media files: performance, deployment, bandwidth, maintainability

Covered by F-06/F-07. Summary: **the problem is not "media in the repo" as a principle** — for a site this size, keeping optimized images in the repo is fine and simple. The problems are (a) unreferenced files, (b) originals used as thumbnails, (c) a 14 MB photo, (d) 144 MB of git history. GitHub Pages limits (1 GB site, 100 GB/month soft bandwidth) are not near — this is a user-experience and workflow cost, not a platform-limit crisis.

## 10. Form implementation vs. documentation vs. live site

- Repo ↔ live site: **identical** (fetched 2026-07-13; same Recess.tv label, same fields, same testimonials, same pricing).
- Visible text ↔ actual integration: **contradicts** (F-01).
- Visible promise ("within 24 h", "we contact you to book") ↔ described real workflow (manual, no tracking): the *text* matches the manual workflow, but nothing enforces it — see doc 03 for where applicants can silently fall through.

---

### Reading guide for the maintainer (learning notes)

- The highest-value skill practiced here: **tracing a visible behavior to its source lines** before judging it. Every claim above is checkable with `grep -n` in under a minute.
- The single most transferable finding: F-02/F-03 — *duplicated representations of the same fact* (two string copies, two media lists, label-as-value options) are where small sites rot first. When you see the same information twice, ask "which one is authoritative, and what happens when they disagree?"
