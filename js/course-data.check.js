/*
 * course-data.check.js — TEMPORARY verification. Safe to delete after this
 * learning checkpoint. It renders NOTHING. It only proves that the new
 * single-source COURSES data agrees with what the page already shows, so we can
 * trust it before any real code starts reading from it.
 *
 * Open the site, open DevTools → Console:
 *   • all green  → the data matches the live page, we can build on it next.
 *   • a red line → COURSES and the page disagree; that mismatch is the finding.
 *
 * It reads T.sv / T.zh (the existing translation dictionary, always defined)
 * and the live registration dropdown. It never throws — it reports.
 */
(function checkCourseData() {
  const problems = [];
  const check = (cond, msg) => { if (!cond) problems.push(msg); };

  // 1. Structure -----------------------------------------------------------
  check(Array.isArray(COURSES) && COURSES.length === 4,
        `expected 4 courses, found ${COURSES && COURSES.length}`);

  const ids = COURSES.map(c => c.id);
  check(new Set(ids).size === ids.length, `course ids are not unique: ${ids}`);

  const registrable = COURSES.filter(c => c.registrable);
  check(registrable.length === 3,
        `expected 3 registrable courses (elite is coach-selected), found ${registrable.length}`);

  // 2. Days match the existing translation dictionary, in BOTH languages ----
  COURSES.forEach(c => {
    check(T.sv[`class.${c.id}.days`] === c.days.sv,
          `days.sv drift for "${c.id}": data="${c.days.sv}" vs T.sv="${T.sv[`class.${c.id}.days`]}"`);
    check(T.zh[`class.${c.id}.days`] === c.days.zh,
          `days.zh drift for "${c.id}": data="${c.days.zh}" vs T.zh="${T.zh[`class.${c.id}.days`]}"`);
  });

  // 3. Level matches (the 3 self-serve classes use a .level key; elite differs)
  registrable.forEach(c => {
    check(T.sv[`class.${c.id}.level`] === c.level.sv,
          `level.sv drift for "${c.id}": data="${c.level.sv}" vs T.sv="${T.sv[`class.${c.id}.level`]}"`);
  });

  // 4. The age NUMBERS actually appear in the page's age text --------------
  COURSES.forEach(c => {
    if (c.ageMin == null) return;                 // elite has no numeric age
    const ageText = T.sv[`class.${c.id}.age`] || '';
    check(ageText.includes(String(c.ageMin)),
          `ageMin ${c.ageMin} not found in "${c.id}" age text "${ageText}"`);
    if (c.ageMax != null) {
      check(ageText.includes(String(c.ageMax)),
            `ageMax ${c.ageMax} not found in "${c.id}" age text "${ageText}"`);
    }
  });

  // 5. Each registrable course really exists as a live dropdown <option> ----
  const optionText = [...document.querySelectorAll('select[name="klass"] option')]
                       .map(o => o.textContent.trim());
  registrable.forEach(c => {
    const found = optionText.some(t => t.startsWith(c.name.sv) || t.startsWith(c.name.zh));
    check(found, `no dropdown option starts with "${c.name.sv}" / "${c.name.zh}" for "${c.id}"`);
  });

  // Report -----------------------------------------------------------------
  if (problems.length === 0) {
    console.log('%c✓ course-data parity: all 4 courses match the page', 'color:#0a0');
  } else {
    console.warn(`✗ course-data parity: ${problems.length} mismatch(es)`);
    problems.forEach(p => console.warn('  •', p));
  }
})();
