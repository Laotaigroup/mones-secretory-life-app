export default function TodayView({ vm, isMobile }) {
  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ color: '#9C99AE', fontSize: 13 }}>{vm.todayLabel}</div>
        <div style={{ color: '#F5B942', fontSize: 13, fontWeight: 700 }}>{vm.todayDoneCount}/{vm.todayTotalCount} ສຳເລັດແລ້ວ</div>
      </div>

      {vm.buckets.map((bkt) => (
        <div key={bkt.name} style={{ marginBottom: 18 }}>
          <div style={{ color: '#6b6a80', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>{bkt.name}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bkt.items.map((item) => (
              <div key={item.iid} style={{ background: '#1B1B29', borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, opacity: item.doneOpacity }}>
                <div onClick={item.toggle} style={{ width: isMobile ? 32 : 26, height: isMobile ? 32 : 26, borderRadius: '50%', border: `2px solid ${item.color}`, background: item.checkBg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {item.done && <svg width="13" height="10" viewBox="0 0 13 10"><path d="M1 5l4 4 7-8" stroke="#14141F" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#F1EFEA', fontSize: 14.5, fontWeight: 600, textDecoration: item.doneDecoration }}>{item.name}</div>
                  <div style={{ color: '#8B899C', fontSize: 12.5, marginTop: 1 }}>{item.detail}</div>
                </div>
                <div style={{ color: '#6b6a80', fontSize: 12, flexShrink: 0 }}>{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {vm.addingOpen && (
        <div style={{ background: '#1B1B29', borderRadius: 18, padding: 16, marginTop: 4 }}>
          <input value={vm.newTaskName} onChange={vm.onNewTaskNameChange} placeholder="ເຊັ່ນ: ໂທຫາໝູ່, ຈົດບັນທຶກ..." style={{ width: '100%', background: '#0F0F17', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: '10px 12px', color: '#F1EFEA', fontSize: 14, fontFamily: "'Noto Sans Lao',sans-serif", outline: 'none' }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {vm.catSwatches.map((sw) => (
              <div key={sw.id} onClick={sw.select} style={{ width: isMobile ? 38 : 34, height: isMobile ? 38 : 34, borderRadius: '50%', background: sw.color, border: sw.ring, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#14141F', cursor: 'pointer' }}>{sw.letter}</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <div onClick={vm.cancelAdd} style={{ flex: 1, textAlign: 'center', padding: 10, borderRadius: 12, background: 'rgba(255,255,255,.06)', color: '#9C99AE', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>ຍົກເລີກ</div>
            <div onClick={vm.submitAdd} style={{ flex: 1, textAlign: 'center', padding: 10, borderRadius: 12, background: '#F5B942', color: '#14141F', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>ເພີ່ມ</div>
          </div>
        </div>
      )}
      {vm.addingClosed && (
        <div onClick={vm.startAdd} style={{ textAlign: 'center', padding: 13, borderRadius: 16, border: '1.5px dashed rgba(255,255,255,.18)', color: '#8B899C', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}>+ ເພີ່ມລາຍການ</div>
      )}
    </div>
  );
}
