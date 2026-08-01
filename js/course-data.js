/*
 * course-data.js — SINGLE SOURCE OF TRUTH for the club's classes.
 *
 * Today nothing on the page reads from this file yet. It exists so that the
 * class facts (which classes, their ages, names, level, days) live in ONE
 * place. Later steps will make the registration dropdown, the class cards and
 * the schedule read from here instead of each holding a hand-typed copy.
 *
 * Rule for this file: DATA ONLY. No DOM access, no logic. If you are tempted to
 * write an `if` or touch `document` here, it belongs in another file.
 *
 * `age` is stored as NUMBERS (the fact), not as text like "5 – 7 år". The label
 * is derived later, so one edit here fixes the card, the dropdown and the
 * schedule at the same time. `ageMax: null` means "and up" (e.g. 12+).
 */
const COURSES = [
  {
    id: 'mini',                                          // stable, language-independent key
    name:  { sv: 'Mini Klass',    zh: '儿童基础班' },
    ageMin: 5, ageMax: 7,
    level: { sv: 'Nybörjare',     zh: '初学' },
    days:  { sv: 'Tis, Fre, Lör', zh: '周二、周五、周六' },
    registrable: true,                                   // appears in the sign-up dropdown
  },
  {
    id: 'junior',
    name:  { sv: 'Junior Klass',  zh: '儿童进阶班' },
    ageMin: 8, ageMax: 11,
    level: { sv: 'Alla nivåer',   zh: '各级别' },
    days:  { sv: 'Ons, Fre, Lör', zh: '周三、周五、周六' },
    registrable: true,
  },
  {
    id: 'youth',
    name:  { sv: 'Ungdom & Vuxen', zh: '青少年&成人班' },
    ageMin: 12, ageMax: null,
    level: { sv: 'Alla nivåer',    zh: '各级别' },
    days:  { sv: 'Mån, Tor, Fre, Lör, Sön', zh: '周一、周四、周五、周六、周日' },
    registrable: true,
  },
  {
    id: 'elite',
    name:  { sv: 'Tävlingsklass',  zh: '竞技精英班' },
    ageMin: null, ageMax: null,
    level: { sv: 'Utvald av tränaren', zh: '教练选拔' },
    days:  { sv: 'Mån, Lör',       zh: '周一、周六' },
    registrable: false,                                  // coach-selected — NOT a self-serve option
  },
];
