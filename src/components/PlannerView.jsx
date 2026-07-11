import { useState } from 'react';

const TIME_SELECT_STYLE = {
  background: '#0F0F17', border: '1px solid rgba(255,255,255,.16)', borderRadius: 7,
  color: '#F1EFEA', fontSize: 12.5, fontFamily: "'Noto Sans Lao',sans-serif",
  padding: '7px 3px', outline: 'none', cursor: 'pointer', textAlign: 'center', width: 44, flexShrink: 0,
};
const HOURS = Array.from({ length: 24 }, (_, i) => (i < 10 ? '0' + i : '' + i));
const MINUTE_STEPS = ['00', '15', '30', '45'];

function TimeInput({ value, onChange }) {
  const [h, m] = (value || '00:00').split(':');
  const hour = HOURS.includes(h) ? h : '00';
  const minute = m || '00';
  const minuteOptions = MINUTE_STEPS.includes(minute) ? MINUTE_STEPS : [...MINUTE_STEPS, minute].sort();
  const emit = (newH, newM) => onChange({ target: { value: newH + ':' + newM } });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <select value={hour} onChange={(e) => emit(e.target.value, minute)} style={TIME_SELECT_STYLE}>
        {HOURS.map((hh) => <option key={hh} value={hh}>{hh}</option>)}
      </select>
      <span style={{ color: '#6b6a80', fontSize: 12 }}>:</span>
      <select value={minute} onChange={(e) => emit(hour, e.target.value)} style={TIME_SELECT_STYLE}>
        {minuteOptions.map((mm) => <option key={mm} value={mm}>{mm}</option>)}
      </select>
    </div>
  );
}

export default function PlannerView({ vm }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div onClick={vm.prevWeek} style={{ width: 32, height: 32, borderRadius: 10, background: '#1B1B29', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="7" height="12" viewBox="0 0 7 12"><path d="M6 1L1 6l5 5" stroke="#8B899C" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{ color: '#9C99AE', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{vm.plannerWeekLabel}</div>
          <div onClick={vm.nextWeek} style={{ width: 32, height: 32, borderRadius: 10, background: '#1B1B29', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="7" height="12" viewBox="0 0 7 12"><path d="M1 1l5 5-5 5" stroke="#8B899C" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>

        <div onDragOver={vm.onDragOver} onDrop={vm.onBacklogDrop} style={{ flex: 1, background: '#1B1B29', borderRadius: 14, padding: '10px 12px', minWidth: 280 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ color: '#8B899C', fontSize: 11.5, fontWeight: 700 }}>ວຽກທີ່ຍັງບໍ່ໄດ້ຈັດເວລາ · ລາກໄປວາງໃນຕາຕະລາງ ຫຼື ລາກຈາກຕາຕະລາງມາວາງທີ່ນີ້</div>
            <div onClick={vm.startBacklogAdd} style={{ color: '#F5B942', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>+ ເພີ່ມວຽກ</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {vm.backlogChips.map((bc) => (
              <div key={bc.id} draggable onDragStart={bc.dragStart} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.06)', borderRadius: 100, padding: '5px 8px 5px 10px', cursor: 'grab' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: bc.color, flexShrink: 0 }} />
                <div style={{ color: '#F1EFEA', fontSize: 12, fontWeight: 500 }}>{bc.name}</div>
                {bc.hasStars && <div style={{ color: bc.starColor, fontSize: 10, letterSpacing: 1 }}>{bc.starLabel}</div>}
                <div onClick={bc.removeSelf} style={{ color: '#8B899C', fontSize: 12, cursor: 'pointer', padding: '0 2px' }}>✕</div>
              </div>
            ))}
          </div>
          {vm.backlogAdding && (
            <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <input value={vm.newBacklogName} onChange={vm.onNewBacklogNameChange} placeholder="ຊື່ວຽກ..." style={{ flex: 1, minWidth: 120, background: '#0F0F17', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '5px 8px', color: '#F1EFEA', fontSize: 12, fontFamily: "'Noto Sans Lao',sans-serif", outline: 'none' }} />
              {vm.backlogCatSwatches.map((sw) => (
                <div key={sw.id} onClick={sw.select} style={{ width: 20, height: 20, borderRadius: '50%', background: sw.color, border: sw.ring, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 700, color: '#14141F', cursor: 'pointer' }}>{sw.letter}</div>
              ))}
              <div onClick={vm.cancelBacklogAdd} style={{ padding: '5px 9px', borderRadius: 8, background: 'rgba(255,255,255,.06)', color: '#9C99AE', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>ຍົກເລີກ</div>
              <div onClick={vm.submitBacklogAdd} style={{ padding: '5px 9px', borderRadius: 8, background: '#F5B942', color: '#14141F', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>ເພີ່ມ</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', background: '#1F1F2E', borderRadius: 100, padding: 4, marginBottom: 14, maxWidth: 280 }}>
        {vm.plannerViewLabels.map((pvl) => (
          <div key={pvl.id} onClick={pvl.select} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 100, background: pvl.bg, color: pvl.color, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>{pvl.label}</div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
        {vm.freqLegend.map((lg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: lg.color, flexShrink: 0 }} />
            <div style={{ color: '#8B899C', fontSize: 12 }}>{lg.label}</div>
          </div>
        ))}
      </div>

      <div style={{ color: '#6b6a80', fontSize: 12, marginBottom: 10 }}>ລາກລາຍການໄປວາງໃນວັນອື່ນໄດ້ເລີຍ · ສີຈາງເມື່ອເຮັດແລ້ວ</div>

      <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, width: 50, position: 'relative', height: vm.gridHeightPx, marginTop: 46 }}>
          {vm.hourLabels.map((hl, i) => (
            <div key={i} style={{ position: 'absolute', top: hl.topPx, left: 0, right: 8, textAlign: 'right', color: '#54536b', fontSize: 11, transform: 'translateY(-6px)' }}>{hl.label}</div>
          ))}
        </div>
        <div style={{ display: 'flex', flex: 1, minWidth: 980, gap: 6 }}>
          {vm.calendarDays.map((day) => (
            <DayColumn key={day.iso} day={day} vm={vm} />
          ))}
        </div>
      </div>
    </>
  );
}

function DayColumn({ day, vm }) {
  return (
    <div style={{ flex: 1, minWidth: 120 }}>
      <div style={{ textAlign: 'center', padding: '6px 4px', borderRadius: 10, background: day.headerBg, marginBottom: 6 }}>
        <div style={{ color: day.headerColor, fontSize: 13, fontWeight: 700 }}>{day.dayName}</div>
        <div style={{ color: '#6b6a80', fontSize: 11 }}>{day.dateLabel}</div>
      </div>
      <div onDragOver={vm.onDragOver} onDrop={day.onDrop} onClick={day.onGridClick} style={{ position: 'relative', height: vm.gridHeightPx, background: '#1B1B29', borderRadius: 10, backgroundImage: vm.gridBgImage, cursor: 'pointer' }}>
        {day.blocks.map((blk) => (
          <Block key={blk.iid} blk={blk} />
        ))}

        {day.addOpen && (
          <div onClick={vm.stopProp} style={{ position: 'absolute', left: 2, right: 2, top: day.addingTopPx, background: '#22223A', border: '1px solid rgba(255,255,255,.14)', borderRadius: 10, padding: 8, zIndex: 30, boxShadow: '0 6px 18px rgba(0,0,0,.4)' }}>
            <input value={vm.newTaskName} onChange={vm.onNewTaskNameChange} placeholder="ຊື່ລາຍການ..." style={{ width: '100%', background: '#0F0F17', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9, padding: '6px 8px', color: '#F1EFEA', fontSize: 12, fontFamily: "'Noto Sans Lao',sans-serif", outline: 'none' }} />
            <div style={{ display: 'flex', gap: 6, marginTop: 7, alignItems: 'center' }}>
              <TimeInput value={vm.newTaskTime} onChange={vm.onNewTaskTimeChange} />
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {vm.catSwatches.map((sw) => (
                  <div key={sw.id} onClick={sw.select} style={{ width: 22, height: 22, borderRadius: '50%', background: sw.color, border: sw.ring, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#14141F', cursor: 'pointer' }}>{sw.letter}</div>
                ))}
              </div>
            </div>
            <div onClick={vm.onToggleNewTaskIncludePriority} style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 9, cursor: 'pointer' }}>
              <div style={{ width: 16, height: 16, borderRadius: 5, border: '1.5px solid #F5B942', background: vm.newTaskIncludePriorityBg, flexShrink: 0 }} />
              <div style={{ color: '#9C99AE', fontSize: 11.5 }}>ຈັດລຳດັບຄວາມສຳຄັນ</div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <div onClick={vm.cancelAdd} style={{ flex: 1, textAlign: 'center', padding: 6, borderRadius: 8, background: 'rgba(255,255,255,.06)', color: '#9C99AE', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>ຍົກເລີກ</div>
              <div onClick={vm.submitAdd} style={{ flex: 1, textAlign: 'center', padding: 6, borderRadius: 8, background: '#F5B942', color: '#14141F', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>ເພີ່ມ</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Block({ blk }) {
  const [hover, setHover] = useState(false);
  return (
    <div style={{ position: 'absolute', left: blk.leftPx, right: blk.rightPx, top: blk.topPx, height: blk.maxHeightPx, zIndex: blk.zIndex, pointerEvents: 'none' }}>
      <div
        draggable
        onDragStart={blk.dragStart}
        onClick={blk.toggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ height: blk.innerHeightPx, overflow: 'hidden', background: blk.bg, borderLeft: `3px solid ${blk.borderColor}`, borderRadius: 6, padding: '3px 6px', boxShadow: '0 1px 4px rgba(255,255,255,.1)', pointerEvents: 'auto', cursor: blk.cursor }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4 }}>
          <div style={{ color: '#F1EFEA', fontSize: 11.5, fontWeight: 600, textDecoration: blk.decoration, opacity: blk.textOpacity, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}>{blk.name}</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            {hover && (
              <div onClick={blk.openEdit} style={{ width: 16, height: 16, borderRadius: 5, background: 'rgba(255,255,255,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <svg width="9" height="9" viewBox="0 0 24 24"><path d="M12 20h9" stroke="#17161C" strokeWidth="2.4" strokeLinecap="round" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" stroke="#17161C" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            )}
            {blk.hasStars && <div style={{ color: blk.starColor, fontSize: 9, letterSpacing: 1, lineHeight: 1, whiteSpace: 'nowrap' }}>{blk.starLabel}</div>}
          </div>
        </div>
        {blk.showTime && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ color: 'rgba(241,239,234,.55)', fontSize: 10, whiteSpace: 'nowrap' }}>{blk.timeRange}</div>
          </div>
        )}
        {blk.showNote && blk.hasNote && (
          <div style={{ color: 'rgba(241,239,234,.65)', fontSize: 10, marginTop: 2, whiteSpace: 'normal', wordBreak: 'break-word' }}>{blk.note}</div>
        )}
      </div>
      {blk.isEditing && (
        <div onClick={blk.stopProp} style={{ position: 'absolute', left: 0, right: 0, top: blk.innerHeightPx, background: '#1B1B29', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: 8, marginTop: 2, boxShadow: '0 4px 14px rgba(0,0,0,.18)', display: 'flex', flexDirection: 'column', gap: 6, zIndex: 40, pointerEvents: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ color: '#6b6a80', fontSize: 10, width: 28, flexShrink: 0 }}>ເລີ່ມ</div>
              <TimeInput value={blk.timeValue} onChange={blk.onTimeInput} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ color: '#6b6a80', fontSize: 10, width: 28, flexShrink: 0 }}>ຫາ</div>
              <TimeInput value={blk.endTimeValue} onChange={blk.onEndTimeInput} />
            </div>
          </div>
          <input type="date" value={blk.dateValue} onChange={blk.onDateInput} style={{ width: '100%', background: '#0F0F17', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: '4px 5px', color: '#F1EFEA', fontSize: 11, fontFamily: "'Noto Sans Lao',sans-serif", outline: 'none' }} />
          <textarea value={blk.note} onChange={blk.onNoteInput} placeholder="ເພີ່ມລາຍລະອຽດ..." style={{ width: '100%', minHeight: 44, background: '#0F0F17', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: '5px 6px', color: '#F1EFEA', fontSize: 11, fontFamily: "'Noto Sans Lao',sans-serif", outline: 'none', resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 6 }}>
            <div onClick={blk.deleteBlock} style={{ textAlign: 'center', padding: '5px 10px', borderRadius: 7, background: 'rgba(232,85,90,.16)', color: '#E8555A', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>ລຶບ</div>
            <div onClick={blk.closeEdit} style={{ flex: 1, textAlign: 'center', padding: 5, borderRadius: 7, background: '#F5B942', color: '#14141F', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>ສຳເລັດ</div>
          </div>
        </div>
      )}
    </div>
  );
}
