import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CATEGORIES, TASK_INDEX, WORKOUT_SPLIT, PRIORITY_QUADRANTS, PRIORITY_STAR_MAP,
  isoDate, dowMon0, addDays, startOfWeek, daysInMonth, thaiDateLabel, THAI_DOW, THAI_MONTHS,
  freqLabel, freqColor, starColorForCount, hexToRgba, focusForDate,
  getInstancesForDate, getWorkoutInfoForDate,
  timeToTop, minutesToHeight, addMinutesToTime, pad2,
  GRID_START_HOUR, GRID_END_HOUR, HOUR_PX,
  loadLS, saveLS,
} from './data';
import { supabase } from './supabaseClient';

const PERSIST_KEYS = [
  'overrides', 'customByDate', 'completed', 'exerciseVals', 'timeOverrides',
  'durationOverrides', 'deletedIids', 'backlogItems', 'notesByIid', 'taskPriority', 'includePriority',
];
function pickPersisted(s) {
  const out = {};
  PERSIST_KEYS.forEach((k) => { out[k] = s[k]; });
  return out;
}

function initialState() {
  return {
    tab: 'dashboard',
    dashboardView: 'month',
    selectedCategoryId: null,
    plannerWeekOffset: 0,
    plannerDayOffset: 0,
    plannerViewMode: 'week',
    overrides: loadLS('overrides', {}),
    customByDate: loadLS('customByDate', {}),
    completed: loadLS('completed', {}),
    exerciseVals: loadLS('exerciseVals', {}),
    timeOverrides: loadLS('timeOverrides', {}),
    durationOverrides: loadLS('durationOverrides', {}),
    deletedIids: loadLS('deletedIids', {}),
    backlogItems: loadLS('backlogItems', []),
    backlogAdding: false,
    newBacklogName: '',
    newBacklogCat: 'A',
    addingPriorityFor: null,
    newPriorityItemName: '',
    notesByIid: loadLS('notesByIid', {}),
    editingBlockIid: null,
    taskPriority: loadLS('taskPriority', {}),
    includePriority: loadLS('includePriority', {}),
    newTaskIncludePriority: false,
    workoutWeekOffset: 0,
    addingFor: null,
    newTaskName: '',
    newTaskCat: 'A',
    newTaskTime: '12:00',
    addingTopPx: 0,
  };
}

export function useAppState(userId) {
  const [state, setState] = useState(initialState);
  const [syncStatus, setSyncStatus] = useState('idle');
  const hydratedRef = useRef(false);
  const saveTimerRef = useRef(null);
  const patch = (updater) => setState((s) => ({ ...s, ...(typeof updater === 'function' ? updater(s) : updater) }));

  useEffect(() => {
    if (!userId) { hydratedRef.current = false; return; }
    let cancelled = false;
    setSyncStatus('loading');
    supabase.from('app_state').select('state').eq('user_id', userId).maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data && data.state) {
          const remote = data.state;
          patch(() => {
            const merged = {};
            PERSIST_KEYS.forEach((k) => {
              if (remote[k] !== undefined) { merged[k] = remote[k]; saveLS(k, remote[k]); }
            });
            return merged;
          });
        }
        hydratedRef.current = true;
        setSyncStatus('idle');
      });
    return () => { cancelled = true; };
  }, [userId]);

  const persistedSnapshot = JSON.stringify(pickPersisted(state));
  useEffect(() => {
    if (!userId || !hydratedRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSyncStatus('saving');
      supabase.from('app_state')
        .upsert({ user_id: userId, state: JSON.parse(persistedSnapshot), updated_at: new Date().toISOString() })
        .then(({ error }) => setSyncStatus(error ? 'error' : 'saved'));
    }, 1200);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, persistedSnapshot]);

  function toggleInstance(iid) {
    patch((s) => {
      const completed = { ...s.completed };
      if (completed[iid]) delete completed[iid]; else completed[iid] = true;
      saveLS('completed', completed);
      return { completed };
    });
  }

  function setTimeOverride(iid, newTime) {
    patch((s) => {
      const timeOverrides = { ...s.timeOverrides, [iid]: newTime };
      saveLS('timeOverrides', timeOverrides);
      return { timeOverrides };
    });
  }

  function setIncludePriority(iid, val) {
    patch((s) => {
      const includePriority = { ...s.includePriority };
      if (val) includePriority[iid] = true; else delete includePriority[iid];
      saveLS('includePriority', includePriority);
      return { includePriority };
    });
  }

  function setPriority(iid, quadrant) {
    patch((s) => {
      const taskPriority = { ...s.taskPriority };
      if (quadrant) taskPriority[iid] = quadrant; else delete taskPriority[iid];
      saveLS('taskPriority', taskPriority);
      return { taskPriority };
    });
  }

  function addBacklogItemWithPriority(name, quadrant) {
    if (!name || !name.trim()) return;
    patch((s) => {
      const backlogItems = s.backlogItems.slice();
      const id = 'bl-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      backlogItems.push({ id, name: name.trim(), catId: 'A' });
      const taskPriority = { ...s.taskPriority, [id]: quadrant };
      saveLS('backlogItems', backlogItems);
      saveLS('taskPriority', taskPriority);
      return { backlogItems, taskPriority, addingPriorityFor: null, newPriorityItemName: '' };
    });
  }

  function addBacklogItem(name, catId) {
    if (!name || !name.trim()) return;
    patch((s) => {
      const backlogItems = s.backlogItems.slice();
      backlogItems.push({ id: 'bl-' + Date.now() + '-' + Math.floor(Math.random() * 1000), name: name.trim(), catId: catId || 'A' });
      saveLS('backlogItems', backlogItems);
      return { backlogItems, backlogAdding: false, newBacklogName: '' };
    });
  }

  function removeBacklogItem(id) {
    patch((s) => {
      const backlogItems = s.backlogItems.filter((b) => b.id !== id);
      saveLS('backlogItems', backlogItems);
      return { backlogItems };
    });
  }

  function scheduleBacklogItem(id, dateISO, time) {
    const item = state.backlogItems.find((b) => b.id === id);
    if (!item) return;
    const pq = state.taskPriority[id];
    removeBacklogItem(id);
    addCustomTask(dateISO, item.name, item.catId, time, !!pq, pq);
  }

  function deleteInstance(iid) {
    patch((s) => {
      if (iid.indexOf('custom-') === 0) {
        const customByDate = { ...s.customByDate };
        Object.keys(customByDate).forEach((k) => { customByDate[k] = customByDate[k].filter((c) => c.id !== iid); });
        saveLS('customByDate', customByDate);
        return { customByDate, editingBlockIid: null };
      }
      const deletedIids = { ...s.deletedIids, [iid]: true };
      saveLS('deletedIids', deletedIids);
      return { deletedIids, editingBlockIid: null };
    });
  }

  function unscheduleInstance(iid, fromDate) {
    let name, catId;
    if (iid.indexOf('custom-') === 0) {
      const item = (state.customByDate[fromDate] || []).find((c) => c.id === iid);
      if (!item) return;
      name = item.name; catId = item.catId;
    } else {
      const t = TASK_INDEX[iid.slice(11)];
      if (!t) return;
      name = t.name; catId = t.catId;
    }
    const pq = state.taskPriority[iid];
    const inclP = !!state.includePriority[iid];
    deleteInstance(iid);
    patch((s) => {
      const backlogItems = s.backlogItems.slice();
      const id = 'bl-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      backlogItems.push({ id, name, catId });
      saveLS('backlogItems', backlogItems);
      const out = { backlogItems };
      if (pq) {
        const taskPriority = { ...s.taskPriority, [id]: pq };
        delete taskPriority[iid];
        saveLS('taskPriority', taskPriority);
        out.taskPriority = taskPriority;
      }
      if (inclP) {
        const includePriority = { ...s.includePriority, [id]: true };
        delete includePriority[iid];
        saveLS('includePriority', includePriority);
        out.includePriority = includePriority;
      }
      return out;
    });
  }

  function setDurationOverride(iid, min) {
    patch((s) => {
      const durationOverrides = { ...s.durationOverrides, [iid]: Math.max(5, min) };
      saveLS('durationOverrides', durationOverrides);
      return { durationOverrides };
    });
  }

  function setNote(iid, text) {
    patch((s) => {
      const notesByIid = { ...s.notesByIid };
      if (text) notesByIid[iid] = text; else delete notesByIid[iid];
      saveLS('notesByIid', notesByIid);
      return { notesByIid };
    });
  }

  function getExerciseVal(exId) {
    return state.exerciseVals[exId] || { sets: '3', reps: '12', weight: '' };
  }

  function setExerciseVal(exId, field, value) {
    patch((s) => {
      const exerciseVals = { ...s.exerciseVals };
      const cur = { sets: '3', reps: '12', weight: '', ...(exerciseVals[exId] || {}) };
      cur[field] = value;
      exerciseVals[exId] = cur;
      saveLS('exerciseVals', exerciseVals);
      return { exerciseVals };
    });
  }

  function toggleExerciseDone(iid, exId, allExIds) {
    patch((s) => {
      const completed = { ...s.completed };
      const key = iid + '_ex_' + exId;
      if (completed[key]) delete completed[key]; else completed[key] = true;
      const allDone = allExIds.every((id) => !!completed[iid + '_ex_' + id]);
      if (allDone) completed[iid] = true; else delete completed[iid];
      saveLS('completed', completed);
      return { completed };
    });
  }

  function statsForRange(catId, startDate, endDate) {
    let target = 0, progress = 0, rangeDays = 0;
    const overrideSeen = {};
    let d = new Date(startDate);
    while (d <= endDate) {
      const iso = isoDate(d);
      rangeDays++;
      const insts = getInstancesForDate(iso, state.overrides, state.customByDate, state.deletedIids);
      insts.forEach((inst) => {
        const task = inst.custom ? null : TASK_INDEX[inst.taskId];
        const cid = inst.custom ? inst.custom.catId : task.catId;
        if (cid !== catId) return;
        if (task && task.monthlyTargetOverride) {
          if (!overrideSeen[task.id]) overrideSeen[task.id] = { override: task.monthlyTargetOverride, done: 0 };
          if (state.completed[inst.iid]) overrideSeen[task.id].done++;
        } else {
          target++;
          if (state.completed[inst.iid]) progress++;
        }
      });
      d = addDays(d, 1);
    }
    const dim = daysInMonth(startDate.getFullYear(), startDate.getMonth());
    Object.keys(overrideSeen).forEach((tid) => {
      const o = overrideSeen[tid];
      const scaled = Math.max(1, Math.round((o.override * rangeDays) / dim));
      target += scaled;
      progress += Math.min(o.done, scaled);
    });
    return { target, progress };
  }

  function moveInstance(iid, fromDate, toDate) {
    if (fromDate === toDate) return;
    patch((s) => {
      if (iid.indexOf('custom-') === 0) {
        const customByDate = { ...s.customByDate };
        const fromList = (customByDate[fromDate] || []).slice();
        const idx = fromList.findIndex((c) => c.id === iid);
        if (idx < 0) return {};
        const item = fromList[idx];
        fromList.splice(idx, 1);
        customByDate[fromDate] = fromList;
        customByDate[toDate] = (customByDate[toDate] || []).concat([item]);
        saveLS('customByDate', customByDate);
        return { customByDate };
      }
      const overrides = { ...s.overrides };
      const origDate = iid.slice(0, 10);
      if (toDate === origDate) delete overrides[iid]; else overrides[iid] = { to: toDate };
      saveLS('overrides', overrides);
      return { overrides };
    });
  }

  function rescheduleInstance(iid, fromDate, toDate, newTime) {
    if (fromDate !== toDate) moveInstance(iid, fromDate, toDate);
    setTimeOverride(iid, newTime);
  }

  function addCustomTask(dateISO, name, catId, time, includePriority, carryPriorityQuadrant) {
    if (!name || !name.trim()) return;
    patch((s) => {
      const customByDate = { ...s.customByDate };
      const list = (customByDate[dateISO] || []).slice();
      const id = 'custom-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      list.push({ id, name: name.trim(), catId, time: time || '12:00' });
      customByDate[dateISO] = list;
      saveLS('customByDate', customByDate);
      const includePriorityMap = { ...s.includePriority };
      if (includePriority) includePriorityMap[id] = true;
      saveLS('includePriority', includePriorityMap);
      const taskPriority = { ...s.taskPriority };
      if (carryPriorityQuadrant) taskPriority[id] = carryPriorityQuadrant;
      saveLS('taskPriority', taskPriority);
      return { customByDate, addingFor: null, newTaskName: '', newTaskIncludePriority: false, includePriority: includePriorityMap, taskPriority };
    });
  }

  const vm = useMemo(() => {
    const self = { setPriority, toggleInstance, removeBacklogItem, scheduleBacklogItem, rescheduleInstance };
    const today = new Date();
    const todayISO = isoDate(today);
    const year = today.getFullYear(), monthIdx = today.getMonth();
    const tab = state.tab;

    const dashboardView = state.dashboardView || 'month';
    const weekStartForView = startOfWeek(today);
    let rangeStart, rangeEnd;
    if (dashboardView === 'day') { rangeStart = today; rangeEnd = today; }
    else if (dashboardView === 'week') { rangeStart = weekStartForView; rangeEnd = addDays(weekStartForView, 6); }
    else { rangeStart = today; rangeEnd = addDays(today, 29); }

    const catStats = CATEGORIES.map((cat) => {
      const stat = statsForRange(cat.id, rangeStart, rangeEnd);
      const target = stat.target || 1;
      const progress = stat.progress;
      const pct = Math.max(0, Math.min(1, progress / target));
      const tasksWithFreq = cat.tasks.map((t) => ({ ...t, freqLabel: freqLabel(t) }));
      return {
        ...cat, target, progress, pct,
        pctLabel: Math.round(pct * 100) + '%',
        pctBarWidth: Math.round(pct * 100) + '%',
        tasks: tasksWithFreq,
        openDetail: () => patch({ tab: 'categories', selectedCategoryId: cat.id }),
      };
    });

    const cx = 170, cy = 170, maxR = 125, valleyR = 40;
    const starSpokes = [], starMarkers = [], catPetals = [];
    catStats.forEach((c, i) => {
      const angle = (-90 + i * 72) * Math.PI / 180;
      const vAngleBefore = (-90 + i * 72 - 36) * Math.PI / 180;
      const vAngleAfter = (-90 + i * 72 + 36) * Math.PI / 180;
      const vb = (cx + valleyR * Math.cos(vAngleBefore)).toFixed(1) + ',' + (cy + valleyR * Math.sin(vAngleBefore)).toFixed(1);
      const va = (cx + valleyR * Math.cos(vAngleAfter)).toFixed(1) + ',' + (cy + valleyR * Math.sin(vAngleAfter)).toFixed(1);
      const outerFull = (cx + maxR * Math.cos(angle)).toFixed(1) + ',' + (cy + maxR * Math.sin(angle)).toFixed(1);
      const rActual = valleyR + (maxR - valleyR) * c.pct;
      const outerActual = (cx + rActual * Math.cos(angle)).toFixed(1) + ',' + (cy + rActual * Math.sin(angle)).toFixed(1);
      catPetals.push({
        id: c.id,
        palePath: 'M' + cx + ',' + cy + ' L' + vb + ' L' + outerFull + ' L' + va + ' Z',
        actualPath: 'M' + cx + ',' + cy + ' L' + vb + ' L' + outerActual + ' L' + va + ' Z',
        paleFill: hexToRgba(c.color, 0.13),
        actualFill: hexToRgba(c.color, 0.8),
        strokeColor: c.color,
      });
      starSpokes.push({ x1: cx, y1: cy, x2: (cx + maxR * Math.cos(angle)).toFixed(1), y2: (cy + maxR * Math.sin(angle)).toFixed(1) });
      starMarkers.push({ x: (cx + maxR * Math.cos(angle)).toFixed(1), y: (cy + maxR * Math.sin(angle)).toFixed(1), color: c.color });
    });

    const viewLabels = [
      { id: 'day', label: 'ມື້ນີ້' }, { id: 'week', label: 'ອາທິດນີ້' }, { id: 'month', label: 'ເດືອນນີ້' },
    ].map((v) => ({
      id: v.id, label: v.label,
      bg: dashboardView === v.id ? '#F5B942' : 'transparent',
      color: dashboardView === v.id ? '#14141F' : '#5D5A6B',
      select: () => patch({ dashboardView: v.id }),
    }));

    const totalCompleted = Object.keys(state.completed).length;
    const level = Math.floor(totalCompleted / 15) + 1;

    let streak = 0;
    for (let i = 0; i < 60; i++) {
      const d = addDays(today, -i);
      const iso = isoDate(d);
      const insts = getInstancesForDate(iso, state.overrides, state.customByDate, state.deletedIids);
      if (insts.length === 0) { if (i === 0) continue; else break; }
      const doneCount = insts.filter((x) => state.completed[x.iid]).length;
      if (doneCount / insts.length >= 0.6) streak++; else break;
    }

    const rawToday = getInstancesForDate(todayISO, state.overrides, state.customByDate, state.deletedIids);
    const todayItems = rawToday.map((inst) => {
      let name, detail, time, color, catId;
      if (inst.custom) {
        const cc = CATEGORIES.find((c) => c.id === inst.custom.catId) || {};
        name = inst.custom.name; detail = 'ເພີ່ມເອງ'; time = inst.custom.time || '—'; color = cc.color || '#999'; catId = inst.custom.catId;
      } else {
        const t = TASK_INDEX[inst.taskId];
        name = t.name; detail = t.detail; time = t.time; color = t.color; catId = t.catId;
        if (t.id === 'f1') { const fd = focusForDate(new Date(inst.origDate + 'T00:00:00')); if (fd) detail = fd.focus; }
      }
      const done = !!state.completed[inst.iid];
      return {
        iid: inst.iid, name, detail, time, color, catId, done,
        doneOpacity: done ? 0.5 : 1,
        doneDecoration: done ? 'line-through' : 'none',
        checkBg: done ? color : 'transparent',
        toggle: () => toggleInstance(inst.iid),
      };
    }).sort((a, b) => a.time.localeCompare(b.time));

    function bucketOf(time) { const h = parseInt(time, 10) || 0; if (h < 11) return 'ເຊົ້າ'; if (h < 17) return 'ກາງເວັນ'; if (h < 21) return 'ແລງ'; return 'ກ່ອນນອນ'; }
    const buckets = ['ເຊົ້າ', 'ກາງເວັນ', 'ແລງ', 'ກ່ອນນອນ'].map((name) => ({ name, items: todayItems.filter((it) => bucketOf(it.time) === name) })).filter((b) => b.items.length > 0);

    const plannerViewMode = state.plannerViewMode || 'week';
    const weekStart = addDays(startOfWeek(today), state.plannerWeekOffset * 7);
    const dayAnchor = addDays(today, state.plannerDayOffset || 0);
    const plannerRangeStart = plannerViewMode === 'day' ? dayAnchor : weekStart;
    const plannerDayCount = plannerViewMode === 'day' ? 1 : 7;
    const gridHeightNum = (GRID_END_HOUR - GRID_START_HOUR) * HOUR_PX;
    const gridHeightPx = gridHeightNum + 'px';
    const gridBgImage = 'repeating-linear-gradient(to bottom, rgba(255,255,255,.05), rgba(255,255,255,.05) 1px, transparent 1px, transparent ' + HOUR_PX + 'px)';
    const hourLabels = [];
    for (let h = GRID_START_HOUR; h <= GRID_END_HOUR; h++) hourLabels.push({ topPx: ((h - GRID_START_HOUR) * HOUR_PX) + 'px', label: pad2(h) + ':00' });
    const freqLegend = [
      { label: 'ປະຈຳວັນ', color: '#5B8DEF' }, { label: 'ລາຍອາທິດ', color: '#2BB3A3' },
      { label: 'ລາຍເດືອນ', color: '#F0A93B' }, { label: 'ເພີ່ມເອງ', color: '#9C7BEA' },
    ];
    const plannerViewLabels = [{ id: 'week', label: 'ລາຍອາທິດ' }, { id: 'day', label: 'ລາຍວັນ' }].map((v) => ({
      id: v.id, label: v.label,
      bg: plannerViewMode === v.id ? '#F5B942' : 'transparent',
      color: plannerViewMode === v.id ? '#14141F' : '#5D5A6B',
      select: () => patch({ plannerViewMode: v.id }),
    }));

    const calendarDays = [];
    for (let i = 0; i < plannerDayCount; i++) {
      const d = addDays(plannerRangeStart, i);
      const diso = isoDate(d);
      const isToday = diso === todayISO;
      const insts = getInstancesForDate(diso, state.overrides, state.customByDate, state.deletedIids);
      const blocks = insts.map((inst) => {
        let name, color, catId, startTime, durationMin, isBand;
        if (inst.custom) {
          name = inst.custom.name; color = '#9C7BEA'; catId = inst.custom.catId;
          startTime = inst.custom.time || '12:00'; durationMin = 30; isBand = false;
        } else {
          const t = TASK_INDEX[inst.taskId];
          name = t.name; color = freqColor(t.freq); catId = t.catId;
          startTime = t.time; durationMin = t.durationMin || 30; isBand = !!t.isBand;
          if (t.id === 'f1') { const fd = focusForDate(new Date(inst.origDate + 'T00:00:00')); if (fd) name = name + ' · ' + fd.short; }
        }
        if (state.timeOverrides[inst.iid]) startTime = state.timeOverrides[inst.iid];
        if (state.durationOverrides[inst.iid]) durationMin = state.durationOverrides[inst.iid];
        const done = !!state.completed[inst.iid];
        const top = timeToTop(startTime);
        const height = minutesToHeight(durationMin);
        const endTime = addMinutesToTime(startTime, durationMin);
        const note = state.notesByIid[inst.iid] || '';
        const isEditing = state.editingBlockIid === inst.iid;
        const priorityQ = state.taskPriority[inst.iid];
        const starCount = priorityQ ? (PRIORITY_STAR_MAP[priorityQ] || 0) : 0;
        return {
          hasStars: starCount > 0, starLabel: '★'.repeat(starCount), starColor: starColorForCount(starCount),
          iid: inst.iid, name, done, isBand,
          topPx: top + 'px', heightPx: height + 'px',
          leftPx: isBand ? '0px' : '4px', rightPx: isBand ? '0px' : '4px',
          bg: isBand ? hexToRgba(color, 0.14) : hexToRgba(color, done ? 0.14 : 0.85),
          borderColor: color,
          timeRange: startTime + '–' + endTime,
          decoration: done ? 'line-through' : 'none',
          textOpacity: done ? 0.5 : 1,
          zIndex: isEditing ? 20 : (isBand ? 1 : 2),
          cursor: isBand ? 'grab' : 'pointer',
          dragStart: (e) => { e.dataTransfer.setData('text/plain', JSON.stringify({ iid: inst.iid, fromDate: diso })); },
          toggle: isBand ? (() => {}) : (() => toggleInstance(inst.iid)),
          note, hasNote: !!note,
          isEditing,
          timeValue: startTime, endTimeValue: endTime, dateValue: diso,
          openEdit: (e) => { e.stopPropagation(); patch({ editingBlockIid: inst.iid }); },
          closeEdit: (e) => { e.stopPropagation(); patch({ editingBlockIid: null }); },
          deleteBlock: (e) => { e.stopPropagation(); deleteInstance(inst.iid); },
          stopProp: (e) => { e.stopPropagation(); },
          onTimeInput: (e) => { setTimeOverride(inst.iid, e.target.value); },
          onEndTimeInput: (e) => {
            const newEnd = e.target.value; if (!newEnd) return;
            const sp = startTime.split(':'), ep = newEnd.split(':');
            const startMin = parseInt(sp[0], 10) * 60 + parseInt(sp[1], 10);
            let endMin = parseInt(ep[0], 10) * 60 + parseInt(ep[1], 10);
            let diff = endMin - startMin; if (diff <= 0) diff += 1440;
            setDurationOverride(inst.iid, diff);
          },
          onDateInput: (e) => { const newDate = e.target.value; if (newDate) moveInstance(inst.iid, diso, newDate); },
          onNoteInput: (e) => { setNote(inst.iid, e.target.value); },
        };
      }).sort((a, b) => parseFloat(a.topPx) - parseFloat(b.topPx));
      for (let bi = 0; bi < blocks.length; bi++) {
        const naturalHeight = parseFloat(blocks[bi].heightPx);
        if (blocks[bi].isBand) {
          blocks[bi].maxHeightPx = naturalHeight + 'px';
          blocks[bi].innerHeightPx = naturalHeight + 'px';
          blocks[bi].showTime = true;
          blocks[bi].showNote = true;
          continue;
        }
        const curTop = parseFloat(blocks[bi].topPx);
        const nextTop = bi + 1 < blocks.length ? parseFloat(blocks[bi + 1].topPx) : gridHeightNum;
        const available = Math.max(20, nextTop - curTop - 2);
        blocks[bi].maxHeightPx = available + 'px';
        const innerHeight = Math.min(naturalHeight, available);
        blocks[bi].innerHeightPx = innerHeight + 'px';
        blocks[bi].showTime = innerHeight >= 30;
        blocks[bi].showNote = innerHeight >= 46;
      }
      calendarDays.push({
        iso: diso, dayName: THAI_DOW[i], dateLabel: d.getDate() + '/' + (d.getMonth() + 1),
        headerBg: isToday ? '#22223A' : 'transparent', headerColor: isToday ? '#F5B942' : '#F1EFEA',
        blocks,
        onDrop: (e) => {
          e.preventDefault();
          try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const rect = e.currentTarget.getBoundingClientRect();
            const y = e.clientY - rect.top;
            let totalMin = Math.round((GRID_START_HOUR * 60 + (y / HOUR_PX) * 60) / 15) * 15;
            totalMin = Math.max(GRID_START_HOUR * 60, Math.min(GRID_END_HOUR * 60 - 15, totalMin));
            const timeStr = pad2(Math.floor(totalMin / 60)) + ':' + pad2(totalMin % 60);
            if (data.backlogId) scheduleBacklogItem(data.backlogId, diso, timeStr);
            else rescheduleInstance(data.iid, data.fromDate, diso, timeStr);
          } catch { /* ignore malformed drop payload */ }
        },
        onGridClick: (e) => {
          if (e.target !== e.currentTarget) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const y = e.clientY - rect.top;
          let totalMin = Math.round((GRID_START_HOUR * 60 + (y / HOUR_PX) * 60) / 15) * 15;
          totalMin = Math.max(GRID_START_HOUR * 60, Math.min(GRID_END_HOUR * 60 - 15, totalMin));
          const timeStr = pad2(Math.floor(totalMin / 60)) + ':' + pad2(totalMin % 60);
          patch({ addingFor: diso, newTaskName: '', newTaskCat: 'A', newTaskTime: timeStr, addingTopPx: timeToTop(timeStr) });
        },
        addOpen: state.addingFor === diso,
        addingTopPx: (state.addingTopPx || 0) + 'px',
      });
    }
    const plannerRangeLabel = plannerViewMode === 'day' ? thaiDateLabel(plannerRangeStart) : (thaiDateLabel(plannerRangeStart) + ' – ' + thaiDateLabel(addDays(plannerRangeStart, 6)));
    const plannerWeekLabel = plannerRangeLabel;

    const allPlannerItems = [];
    calendarDays.forEach((day) => {
      day.blocks.forEach((blk) => {
        if (blk.isBand) return;
        if (blk.done) return;
        if (!state.includePriority[blk.iid]) return;
        allPlannerItems.push({
          iid: blk.iid, name: blk.name, color: blk.borderColor,
          dayLabel: day.dayName + ' ' + day.dateLabel, timeRange: blk.timeRange,
          quadrant: state.taskPriority[blk.iid] || null,
        });
      });
    });
    state.backlogItems.forEach((b) => {
      const cc = CATEGORIES.find((c) => c.id === b.catId) || {};
      allPlannerItems.push({
        iid: b.id, name: b.name, color: cc.color || '#9C7BEA',
        dayLabel: 'ຍັງບໍ່ໄດ້ຈັດເວລາ', timeRange: '',
        quadrant: state.taskPriority[b.id] || null,
      });
    });
    function makeItem(it) {
      return {
        iid: it.iid, name: it.name, color: it.color, dayLabel: it.dayLabel, timeRange: it.timeRange,
        metaLabel: it.timeRange ? (it.dayLabel + ' · ' + it.timeRange) : it.dayLabel,
        dragStart: (e) => { e.dataTransfer.setData('text/plain', it.iid); },
      };
    }
    const priorityTray = allPlannerItems.filter((it) => !it.quadrant).map(makeItem);
    const priorityQuadrants = PRIORITY_QUADRANTS.map((qd) => ({
      id: qd.id, title: qd.title, sub: qd.sub, color: qd.color,
      stars: '★'.repeat(qd.stars) + '☆'.repeat(3 - qd.stars),
      items: allPlannerItems.filter((it) => it.quadrant === qd.id).map(makeItem),
      onDrop: (e) => { e.preventDefault(); const iid = e.dataTransfer.getData('text/plain'); if (iid) setPriority(iid, qd.id); },
      addOpen: state.addingPriorityFor === qd.id,
      onBoxClick: (e) => { if (e.target !== e.currentTarget) return; patch({ addingPriorityFor: qd.id, newPriorityItemName: '' }); },
      startAdd: (e) => { if (e) e.stopPropagation(); patch({ addingPriorityFor: qd.id, newPriorityItemName: '' }); },
      cancelAdd: (e) => { if (e) e.stopPropagation(); patch({ addingPriorityFor: null }); },
      submitAdd: (e) => { if (e) e.stopPropagation(); addBacklogItemWithPriority(state.newPriorityItemName, qd.id); },
    }));
    const priorityTrayDrop = (e) => { e.preventDefault(); const iid = e.dataTransfer.getData('text/plain'); if (iid) setPriority(iid, null); };

    const workoutWeekStart = addDays(startOfWeek(today), (state.workoutWeekOffset || 0) * 7);
    const workoutDays = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(workoutWeekStart, i);
      const diso = isoDate(d);
      const isToday = diso === todayISO;
      const info = getWorkoutInfoForDate(diso, state.overrides, state.customByDate, state.deletedIids);
      const isRest = !info;
      const exercises = isRest ? [] : info.split.exercises.map((ex) => {
        const vals = getExerciseVal(ex.id);
        const doneKey = info.iid + '_ex_' + ex.id;
        const done = !!state.completed[doneKey];
        const allIds = info.split.exercises.map((e2) => e2.id);
        return {
          id: ex.id, name: ex.name, done,
          decoration: done ? 'line-through' : 'none',
          checkBg: done ? '#4CD97B' : 'transparent',
          sets: vals.sets, reps: vals.reps, weight: vals.weight,
          onSetsChange: (e) => setExerciseVal(ex.id, 'sets', e.target.value),
          onRepsChange: (e) => setExerciseVal(ex.id, 'reps', e.target.value),
          onWeightChange: (e) => setExerciseVal(ex.id, 'weight', e.target.value),
          toggle: () => toggleExerciseDone(info.iid, ex.id, allIds),
        };
      });
      workoutDays.push({
        iso: diso, dayName: THAI_DOW[i], dateLabel: d.getDate() + '/' + (d.getMonth() + 1),
        isToday, isRest, showCount: !isRest,
        focusLabel: isRest ? 'ພັກຜ່ອນ (ບໍ່ມີຕາຕະລາງມື້ນີ້)' : info.split.focus,
        cardBg: isToday ? '#20202f' : '#1B1B29', titleColor: isToday ? '#F5B942' : '#F1EFEA',
        exercises,
        doneCount: exercises.filter((e) => e.done).length, totalCount: exercises.length,
      });
    }
    const workoutWeekLabel = thaiDateLabel(workoutWeekStart) + ' – ' + thaiDateLabel(addDays(workoutWeekStart, 6));

    let selectedCategory = null, categoryHistory = [];
    const categoryDetailOpen = !!state.selectedCategoryId;
    if (categoryDetailOpen) {
      selectedCategory = catStats.find((c) => c.id === state.selectedCategoryId);
      const monthStat = statsForRange(selectedCategory.id, new Date(year, monthIdx, 1), new Date(year, monthIdx, daysInMonth(year, monthIdx)));
      selectedCategory = {
        ...selectedCategory,
        target: monthStat.target || 1, progress: monthStat.progress,
        pctLabel: Math.round(Math.max(0, Math.min(1, monthStat.progress / (monthStat.target || 1))) * 100) + '%',
      };
      for (let i = 5; i >= 0; i--) {
        const d = new Date(year, monthIdx - i, 1);
        const dim = daysInMonth(d.getFullYear(), d.getMonth());
        const st = statsForRange(selectedCategory.id, d, new Date(d.getFullYear(), d.getMonth(), dim));
        const pct = st.target ? Math.max(0, Math.min(1, st.progress / st.target)) : 0;
        categoryHistory.push({ label: THAI_MONTHS[d.getMonth()].slice(0, 3), barHeight: Math.max(3, Math.round(pct * 88)) + 'px' });
      }
    }

    const catSwatches = CATEGORIES.map((c) => ({
      id: c.id, color: c.color, letter: c.letter,
      ring: (state.newTaskCat || 'A') === c.id ? '3px solid #fff' : '3px solid transparent',
      select: () => patch({ newTaskCat: c.id }),
    }));

    const backlogCatSwatches = CATEGORIES.map((c) => ({
      id: c.id, color: c.color, letter: c.letter,
      ring: (state.newBacklogCat || 'A') === c.id ? '3px solid #fff' : '3px solid transparent',
      select: () => patch({ newBacklogCat: c.id }),
    }));
    const backlogChips = state.backlogItems.map((b) => {
      const cc = CATEGORIES.find((c) => c.id === b.catId) || {};
      const pq = state.taskPriority[b.id];
      return {
        id: b.id, name: b.name, color: cc.color || '#9C7BEA',
        hasStars: !!pq, starLabel: pq ? '★'.repeat(PRIORITY_STAR_MAP[pq] || 0) : '', starColor: starColorForCount(pq ? (PRIORITY_STAR_MAP[pq] || 0) : 0),
        dragStart: (e) => { e.dataTransfer.setData('text/plain', JSON.stringify({ backlogId: b.id })); },
        removeSelf: () => removeBacklogItem(b.id),
      };
    });

    const tabTitleMap = { dashboard: 'ພາບລວມເດືອນນີ້', today: 'ມື້ນີ້', categories: categoryDetailOpen ? 'ລາຍລະອຽດ' : 'ໝວດໝູ່', planner: 'ແຜນລາຍອາທິດ', priority: 'ຈັດລຳດັບຄວາມສຳຄັນ', workout: 'ແຜນອອກກຳລັງກາຍ' };

    const navColorsActive = '#F5B942', navColorsInactive = '#54536b';
    const navColors = {
      dashboard: tab === 'dashboard' ? navColorsActive : navColorsInactive,
      today: tab === 'today' ? navColorsActive : navColorsInactive,
      categories: tab === 'categories' ? navColorsActive : navColorsInactive,
      planner: tab === 'planner' ? navColorsActive : navColorsInactive,
      priority: tab === 'priority' ? navColorsActive : navColorsInactive,
      workout: tab === 'workout' ? navColorsActive : navColorsInactive,
    };
    const navBg = {
      dashboard: tab === 'dashboard' ? 'rgba(245,185,66,.12)' : 'transparent',
      today: tab === 'today' ? 'rgba(245,185,66,.12)' : 'transparent',
      categories: tab === 'categories' ? 'rgba(245,185,66,.12)' : 'transparent',
      planner: tab === 'planner' ? 'rgba(245,185,66,.12)' : 'transparent',
      priority: tab === 'priority' ? 'rgba(245,185,66,.12)' : 'transparent',
      workout: tab === 'workout' ? 'rgba(245,185,66,.12)' : 'transparent',
    };

    return {
      tabTitle: tabTitleMap[tab],
      todayLabel: thaiDateLabel(today),
      level, streakDays: streak,
      catStats, catPetals, starSpokes, starMarkers,
      viewLabels,

      tabIsDashboard: tab === 'dashboard', tabIsToday: tab === 'today', tabIsCategories: tab === 'categories',
      tabIsPlanner: tab === 'planner', tabIsWorkout: tab === 'workout', tabIsPriority: tab === 'priority',

      priorityTray, priorityQuadrants, priorityTrayDrop,
      newPriorityItemName: state.newPriorityItemName,
      onNewPriorityItemNameChange: (e) => patch({ newPriorityItemName: e.target.value }),
      onDragOverPriority: (e) => { e.preventDefault(); },

      buckets,
      todayDoneCount: todayItems.filter((i) => i.done).length, todayTotalCount: todayItems.length,
      addingOpen: state.addingFor === todayISO, addingClosed: state.addingFor !== todayISO,
      startAdd: () => patch({ addingFor: todayISO, newTaskName: '', newTaskCat: 'A' }),
      cancelAdd: () => patch({ addingFor: null }),
      newTaskName: state.newTaskName,
      onNewTaskNameChange: (e) => patch({ newTaskName: e.target.value }),
      catSwatches,
      submitAdd: () => addCustomTask(state.addingFor || todayISO, state.newTaskName, state.newTaskCat || 'A', state.newTaskTime, state.newTaskIncludePriority),
      newTaskIncludePriority: !!state.newTaskIncludePriority,
      newTaskIncludePriorityBg: state.newTaskIncludePriority ? '#F5B942' : 'transparent',
      onToggleNewTaskIncludePriority: () => patch((s) => ({ newTaskIncludePriority: !s.newTaskIncludePriority })),
      newTaskTime: state.newTaskTime || '12:00',
      onNewTaskTimeChange: (e) => patch({ newTaskTime: e.target.value }),

      categoryListOpen: !categoryDetailOpen, categoryDetailOpen,
      closeCategory: () => patch({ selectedCategoryId: null }),
      selectedCategory, categoryHistory,

      calendarDays, plannerWeekLabel,
      hourLabels, gridHeightPx, gridBgImage, freqLegend,
      plannerViewLabels,
      backlogChips, backlogCatSwatches,
      onBacklogDrop: (e) => {
        e.preventDefault();
        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          if (data.iid && data.fromDate && !data.backlogId) unscheduleInstance(data.iid, data.fromDate);
        } catch { /* ignore malformed or non-JSON drop payload */ }
      },
      backlogAdding: state.backlogAdding, backlogClosed: !state.backlogAdding,
      startBacklogAdd: () => patch({ backlogAdding: true, newBacklogName: '', newBacklogCat: 'A' }),
      cancelBacklogAdd: () => patch({ backlogAdding: false }),
      newBacklogName: state.newBacklogName,
      onNewBacklogNameChange: (e) => patch({ newBacklogName: e.target.value }),
      submitBacklogAdd: () => addBacklogItem(state.newBacklogName, state.newBacklogCat || 'A'),
      prevWeek: () => patch((s) => (s.plannerViewMode === 'day' ? { plannerDayOffset: (s.plannerDayOffset || 0) - 1 } : { plannerWeekOffset: s.plannerWeekOffset - 1 })),
      nextWeek: () => patch((s) => (s.plannerViewMode === 'day' ? { plannerDayOffset: (s.plannerDayOffset || 0) + 1 } : { plannerWeekOffset: s.plannerWeekOffset + 1 })),
      onDragOver: (e) => { e.preventDefault(); },
      stopProp: (e) => { e.stopPropagation(); },

      workoutDays, workoutWeekLabel,
      prevWorkoutWeek: () => patch((s) => ({ workoutWeekOffset: (s.workoutWeekOffset || 0) - 1 })),
      nextWorkoutWeek: () => patch((s) => ({ workoutWeekOffset: (s.workoutWeekOffset || 0) + 1 })),

      navColors, navBg,
      goDashboard: () => patch({ tab: 'dashboard' }),
      goToday: () => patch({ tab: 'today' }),
      goCategories: () => patch({ tab: 'categories' }),
      goPlanner: () => patch({ tab: 'planner' }),
      goPriority: () => patch({ tab: 'priority' }),
      goWorkout: () => patch({ tab: 'workout' }),
      syncStatus,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, syncStatus]);

  return vm;
}
