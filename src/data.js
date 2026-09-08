export function pad2(n) { return n < 10 ? '0' + n : '' + n; }
export function isoDate(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
export function dowMon0(d) { return (d.getDay() + 6) % 7; }
export function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
export function startOfWeek(d) { return addDays(d, -dowMon0(d)); }
export function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }

export const THAI_MONTHS = ['ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ', 'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ'];
export const THAI_DOW = ['ຈັນ', 'ອັງຄານ', 'ພຸດ', 'ພະຫັດ', 'ສຸກ', 'ເສົາ', 'ອາທິດ'];
export function thaiDateLabel(d) { return d.getDate() + ' ' + THAI_MONTHS[d.getMonth()] + ' ' + (d.getFullYear() + 543); }

export function freqLabel(t) {
  if (t.freq === 'daily') return 'ທຸກວັນ';
  if (t.freq === 'weekday') return 'ວັນຈັນ-ສຸກ';
  if (t.freq === 'weeklyDays') return t.days.length + ' ຄັ້ງ/ອາທິດ';
  if (t.freq === 'monthlyDay') return 'ລາຍເດືອນ';
  return '';
}

export const GRID_START_HOUR = 5, GRID_END_HOUR = 23, HOUR_PX = 52;
export function timeToTop(hhmm) { const p = hhmm.split(':'); const h = parseInt(p[0], 10), m = parseInt(p[1], 10); return (h - GRID_START_HOUR + m / 60) * HOUR_PX; }
export function minutesToHeight(min) { return Math.max(34, min / 60 * HOUR_PX); }
export function addMinutesToTime(hhmm, min) {
  const p = hhmm.split(':');
  let total = parseInt(p[0], 10) * 60 + parseInt(p[1], 10) + min;
  total = ((total % 1440) + 1440) % 1440;
  return pad2(Math.floor(total / 60)) + ':' + pad2(total % 60);
}
export function freqColor(freq) {
  if (freq === 'monthlyDay') return '#F0A93B';
  if (freq === 'weeklyDays') return '#2BB3A3';
  return '#5B8DEF';
}
export function starColorForCount(n) { if (n >= 3) return '#E8555A'; if (n === 2) return '#3E8FDE'; if (n === 1) return '#FFFFFF'; return '#F5B942'; }
export function hexToRgba(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16), g = parseInt(h.substring(2, 4), 16), b = parseInt(h.substring(4, 6), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

export const CATEGORIES = [
  { id: 'A', letter: 'A', name: 'ພັດທະນາຕົນເອງ', sub: 'ການຮຽນຮູ້', color: '#8B7CF6', note: 'ສ່ວນຫຼາຍກ່ອນນອນ',
    tasks: [
      { id: 'a1', name: 'ອ່ານປຶ້ມ', detail: '30 ນາທີ', freq: 'daily', time: '21:30', durationMin: 30 },
      { id: 'a2', name: 'ນັ່ງສະມາທິ', detail: '15 ນາທີ', freq: 'daily', time: '05:30', durationMin: 20 },
      { id: 'a3', name: 'ຊອກຫາຄວາມຮູ້ໃໝ່ໆ', detail: '1-2 ຊມ.', freq: 'weeklyDays', days: [1, 3], time: '19:30', durationMin: 90 },
    ] },
  { id: 'B', letter: 'B', name: 'ຄອບຄົວ', sub: 'ຄວາມສຳພັນ', color: '#FF7A6B', note: 'ຕອນແລງ',
    tasks: [
      { id: 'b1', name: 'ກິນເຂົ້າກັບພໍ່ແມ່', detail: '2 ຄັ້ງ/ເດືອນ', freq: 'monthlyDay', dayOfMonth: 7, time: '18:30', durationMin: 90 },
      { id: 'b1b', name: 'ກິນເຂົ້າກັບພໍ່ແມ່', detail: '2 ຄັ້ງ/ເດືອນ', freq: 'monthlyDay', dayOfMonth: 21, time: '18:30', durationMin: 90 },
      { id: 'b2', name: 'ກິນເຂົ້າກັບພໍ່ແມ່ແຟນ', detail: '2 ຄັ້ງ/ເດືອນ', freq: 'monthlyDay', dayOfMonth: 14, time: '18:30', durationMin: 90 },
      { id: 'b2b', name: 'ກິນເຂົ້າກັບພໍ່ແມ່ແຟນ', detail: '2 ຄັ້ງ/ເດືອນ', freq: 'monthlyDay', dayOfMonth: 28, time: '18:30', durationMin: 90 },
      { id: 'b3', name: 'ກິນເຂົ້າກັບແມ່ຕູ້', detail: '1 ຄັ້ງ/ເດືອນ', freq: 'monthlyDay', dayOfMonth: 3, time: '12:00', durationMin: 90 },
    ] },
  { id: 'C', letter: 'C', name: 'ພັດທະນາໂປຣແກຣມ', sub: 'ທຸລະກິດບໍລິສັດ', color: '#4EA1F7', note: 'ເວລາເຮັດວຽກ',
    tasks: [
      { id: 'c2', name: 'ເຮັດວຽກ (ອອຟິດ)', detail: '6 ວັນ/ອາທິດ · 8:00–17:00', freq: 'weeklyDays', days: [0, 1, 2, 3, 4, 5], time: '08:00', durationMin: 540, isBand: true },
    ] },
  { id: 'E', letter: 'E', name: 'ການໃຫ້', sub: 'ຄວາມໝາຍຂອງຊີວິດ', color: '#F5B942', note: '',
    tasks: [ { id: 'e1', name: 'ຝຶກອົບຮົມພະນັກງານ', detail: '1 ຄັ້ງ/ເດືອນ', freq: 'monthlyDay', dayOfMonth: 10, time: '14:00', durationMin: 60 } ] },
  { id: 'F', letter: 'F', name: 'ສຸຂະພາບ', sub: 'ພະລັງງານ', color: '#4CD97B', note: 'ຕອນເຊົ້າ',
    tasks: [
      { id: 'f1', name: 'ອອກກຳລັງກາຍ', detail: 'ຕາມໂປຣແກຣມ 6 ວັນ/ອາທິດ', freq: 'weeklyDays', days: [0, 1, 2, 3, 4, 5], time: '05:50', durationMin: 60 },
      { id: 'f2', name: 'ແລ່ນ', detail: 'ວັນອັງຄານ ພະຫັດ ເສົາ', freq: 'weeklyDays', days: [1, 3, 5], time: '18:00', durationMin: 60 },
      { id: 'f3', name: 'ຕີແບດມິນຕັນ', detail: 'ທຸກວັນຈັນ', freq: 'weeklyDays', days: [0], time: '19:00', durationMin: 120 },
      { id: 'f4', name: 'ກິນອາຫານເສີມ', detail: '3 ເມັດ ທຸກວັນ', freq: 'daily', time: '07:00', durationMin: 10 },
      { id: 'f5', name: 'IF 23:1', detail: 'ເປົ້າໝາຍ 20 ວັນ/ເດືອນ', freq: 'daily', time: '22:00', durationMin: 60, monthlyTargetOverride: 20 },
    ] },
];

export const TASK_INDEX = {};
CATEGORIES.forEach((cat) => cat.tasks.forEach((t) => { TASK_INDEX[t.id] = Object.assign({}, t, { catId: cat.id, color: cat.color, letter: cat.letter, catName: cat.name }); }));

export const WORKOUT_SPLIT = {
  0: { focus: 'ໜ້າເອິກ (Chest)', short: 'ເອິກ', exercises: [
    { id: 'ex_incline_press', name: 'Incline Dumbbell Press' },
    { id: 'ex_db_flys', name: 'Dumbbell Flys' },
    { id: 'ex_db_press', name: 'Dumbbell Press' },
    { id: 'ex_pec_deck', name: 'Pec Deck Flies' },
  ] },
  1: { focus: 'ແຂນ (Biceps & Forearms)', short: 'ແຂນ', exercises: [
    { id: 'ex_curls', name: 'Curls' },
    { id: 'ex_hammer_curls', name: 'Hammer Curls' },
    { id: 'ex_wrist_curls', name: 'Wrist Curls' },
    { id: 'ex_wrist_twist', name: 'Dumbbell Wrist Twist' },
  ] },
  2: { focus: 'ໜ້າທ້ອງ (Abs / Core)', short: 'ໜ້າທ້ອງ', exercises: [
    { id: 'ex_side_bends', name: 'Dumbbell Side Bends' },
    { id: 'ex_crunches', name: 'Crunches' },
    { id: 'ex_jackknife', name: 'Seated Jackknife' },
    { id: 'ex_core_twist', name: 'Core Twist' },
  ] },
  3: { focus: 'ບ່າ & ໄທຣເຊັບ (Shoulders & Triceps)', short: 'ບ່າ/ໄທຣເຊັບ', exercises: [
    { id: 'ex_seated_press', name: 'Seated Dumbbell Presses' },
    { id: 'ex_rear_delt', name: 'Dumbbell Rear Deltoid Raises' },
    { id: 'ex_pushdown', name: 'Push-Downs' },
    { id: 'ex_1arm_tri_ext', name: 'One-Arm Dumbbell Triceps Extensions' },
  ] },
  4: { focus: 'ຫຼັງ (Back)', short: 'ຫຼັງ', exercises: [
    { id: 'ex_deadlift', name: 'Deadlifts' },
    { id: 'ex_lat_pulldown', name: 'Lat Pull-Downs' },
    { id: 'ex_1arm_row', name: 'One-Arm Dumbbell Rows' },
    { id: 'ex_bent_row', name: 'Bent Over Row' },
  ] },
  5: { focus: 'ຂາ (Legs)', short: 'ຂາ', exercises: [
    { id: 'ex_toe_raise', name: 'Toe Raises' },
    { id: 'ex_calf_jump', name: 'Dumbbell Calf Jump' },
    { id: 'ex_lunges', name: 'Dumbbell Lunges' },
    { id: 'ex_squats', name: 'Dumbbell Squats' },
  ] },
};
export function focusForDate(d) { return WORKOUT_SPLIT[dowMon0(d)] || null; }

export const PRIORITY_QUADRANTS = [
  { id: 'q1', title: 'ສຳຄັນຫຼາຍ · ດ່ວນຫຼາຍ', sub: 'ເຮັດທັນທີ', stars: 3, color: '#E8555A' },
  { id: 'q2', title: 'ສຳຄັນຫຼາຍ · ດ່ວນໜ້ອຍ', sub: 'ວາງແຜນເຮັດ', stars: 2, color: '#3E8FDE' },
  { id: 'q3', title: 'ສຳຄັນໜ້ອຍ · ດ່ວນຫຼາຍ', sub: 'ມອບໝາຍ/ເຮັດໄວໆ', stars: 2, color: '#F0A93B' },
  { id: 'q4', title: 'ສຳຄັນໜ້ອຍ · ດ່ວນໜ້ອຍ', sub: 'ເຮັດພາຍຫຼັງ/ຕັດອອກ', stars: 1, color: '#66637A' },
];
export const PRIORITY_STAR_MAP = {};
PRIORITY_QUADRANTS.forEach((qd) => { PRIORITY_STAR_MAP[qd.id] = qd.stars; });

export function getWorkoutInfoForDate(diso, overrides, customByDate, deletedIids) {
  const insts = getInstancesForDate(diso, overrides, customByDate, deletedIids);
  const f1Inst = insts.find((inst) => !inst.custom && inst.taskId === 'f1');
  if (!f1Inst) return null;
  const split = WORKOUT_SPLIT[dowMon0(new Date(f1Inst.origDate + 'T00:00:00'))];
  if (!split) return null;
  return { split, iid: f1Inst.iid, origDate: f1Inst.origDate };
}

export function generateDefaultDayTaskIds(d) {
  const dow = dowMon0(d), dom = d.getDate();
  const ids = [];
  Object.keys(TASK_INDEX).forEach((id) => {
    const t = TASK_INDEX[id];
    if (t.freq === 'daily') ids.push(id);
    else if (t.freq === 'weekday' && dow <= 4) ids.push(id);
    else if (t.freq === 'weeklyDays' && t.days.indexOf(dow) >= 0) ids.push(id);
    else if (t.freq === 'monthlyDay' && t.dayOfMonth === dom) ids.push(id);
  });
  return ids;
}

export function getInstancesForDate(iso, overrides, customByDate, deletedIids) {
  const d = new Date(iso + 'T00:00:00');
  const own = generateDefaultDayTaskIds(d)
    .map((taskId) => ({ iid: iso + '_' + taskId, taskId, origDate: iso }))
    .filter((inst) => !(overrides[inst.iid] && overrides[inst.iid].to !== iso));
  const movedIn = Object.keys(overrides)
    .filter((iid) => overrides[iid].to === iso && iid.slice(0, 10) !== iso)
    .map((iid) => ({ iid, taskId: iid.slice(11), origDate: iid.slice(0, 10) }));
  const customs = (customByDate[iso] || []).map((c) => ({ iid: c.id, taskId: null, custom: c, origDate: iso }));
  return own.concat(movedIn, customs).filter((inst) => !deletedIids[inst.iid]);
}

export function loadLS(key, fallback) {
  try { const raw = localStorage.getItem('mone_' + key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
export function saveLS(key, val) {
  try { localStorage.setItem('mone_' + key, JSON.stringify(val)); } catch { /* storage unavailable */ }
}
