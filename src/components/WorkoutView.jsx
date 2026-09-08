export default function WorkoutView({ vm, isMobile }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div onClick={vm.prevWorkoutWeek} style={{ width: 32, height: 32, borderRadius: 10, background: '#1B1B29', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <svg width="7" height="12" viewBox="0 0 7 12"><path d="M6 1L1 6l5 5" stroke="#8B899C" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div style={{ color: '#9C99AE', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{vm.workoutWeekLabel}</div>
        <div onClick={vm.nextWorkoutWeek} style={{ width: 32, height: 32, borderRadius: 10, background: '#1B1B29', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <svg width="7" height="12" viewBox="0 0 7 12"><path d="M1 1l5 5-5 5" stroke="#8B899C" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>

      <div style={{ background: '#1B1B29', borderRadius: 16, padding: '12px 16px', marginBottom: 16, color: '#9C99AE', fontSize: 12, lineHeight: 1.5 }}>
        6 ວັນ/ອາທິດຕາມໂປຣແກຣມທີ່ສົ່ງມາ (ວັນອາທິດພັກ) · ໃສ່ນ້ຳໜັກ ແລະ ຈຳນວນເທື່ອເອງໄດ້ເລີຍ ແລ້ວກົດວົງມົນເມື່ອເຮັດຄົບ
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14, alignItems: 'start' }}>
        {vm.workoutDays.map((wday) => (
          <div key={wday.iso} style={{ background: wday.cardBg, borderRadius: 18, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <div style={{ color: wday.titleColor, fontSize: 14, fontWeight: 700 }}>{wday.dayName}</div>
                <div style={{ color: '#6b6a80', fontSize: 11.5 }}>{wday.dateLabel}</div>
                <div style={{ color: '#4CD97B', fontSize: 12.5, fontWeight: 600 }}>{wday.focusLabel}</div>
              </div>
              {wday.showCount && <div style={{ color: '#6b6a80', fontSize: 12, flexShrink: 0 }}>{wday.doneCount}/{wday.totalCount}</div>}
            </div>

            {wday.isRest && <div style={{ color: '#54536b', fontSize: 12.5, padding: '4px 0' }}>ວັນພັກຜ່ອນ — ບໍ່ມີຕາຕະລາງເວດ</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {wday.exercises.map((ex) => (
                <div key={ex.id} style={{ background: '#0F0F17', borderRadius: 14, padding: '11px 13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
                    <div onClick={ex.toggle} style={{ width: isMobile ? 32 : 23, height: isMobile ? 32 : 23, borderRadius: '50%', border: '2px solid #4CD97B', background: ex.checkBg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      {ex.done && <svg width="12" height="9" viewBox="0 0 13 10"><path d="M1 5l4 4 7-8" stroke="#0F0F17" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, color: '#F1EFEA', fontSize: 13.5, fontWeight: 600, textDecoration: ex.decoration }}>{ex.name}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, paddingLeft: isMobile ? 42 : 33 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#54536b', fontSize: 10, marginBottom: 3 }}>ເຊັດ</div>
                      <input value={ex.sets} onChange={ex.onSetsChange} style={{ width: '100%', background: '#1B1B29', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '6px 4px', color: '#F1EFEA', fontSize: 12.5, textAlign: 'center', fontFamily: "'Noto Sans Lao',sans-serif", outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#54536b', fontSize: 10, marginBottom: 3 }}>ຄັ້ງ/ເຊັດ</div>
                      <input value={ex.reps} onChange={ex.onRepsChange} style={{ width: '100%', background: '#1B1B29', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '6px 4px', color: '#F1EFEA', fontSize: 12.5, textAlign: 'center', fontFamily: "'Noto Sans Lao',sans-serif", outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#54536b', fontSize: 10, marginBottom: 3 }}>ນ້ຳໜັກ (ກກ.)</div>
                      <input value={ex.weight} onChange={ex.onWeightChange} placeholder="—" style={{ width: '100%', background: '#1B1B29', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '6px 4px', color: '#F1EFEA', fontSize: 12.5, textAlign: 'center', fontFamily: "'Noto Sans Lao',sans-serif", outline: 'none' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
