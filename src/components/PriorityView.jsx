export default function PriorityView({ vm }) {
  return (
    <>
      <div style={{ color: '#8B899C', fontSize: 13, marginBottom: 14 }}>ລາກລາຍການຈາກລຸ່ມໄປວາງໃນຊ່ອງທີ່ເໝາະສົມ · ລະບົບຈະໃຫ້ດາວຄວາມສຳຄັນອັດຕະໂນມັດ</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        {vm.priorityQuadrants.map((q) => (
          <div key={q.id} onDragOver={vm.onDragOverPriority} onDrop={q.onDrop} onClick={q.onBoxClick} style={{ background: 'rgba(255,255,255,.03)', border: `1.5px solid ${q.color}`, borderRadius: 16, padding: 14, minHeight: 140, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <div style={{ color: '#F1EFEA', fontSize: 13.5, fontWeight: 700 }}>{q.title}</div>
              <div style={{ color: q.color, fontSize: 13, letterSpacing: 1 }}>{q.stars}</div>
            </div>
            <div style={{ color: '#6b6a80', fontSize: 11.5, marginBottom: 10 }}>{q.sub}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {q.items.map((it) => (
                <div key={it.iid} draggable onDragStart={it.dragStart} style={{ background: '#1B1B29', borderLeft: `3px solid ${it.color}`, borderRadius: 8, padding: '7px 10px', cursor: 'grab' }}>
                  <div style={{ color: '#F1EFEA', fontSize: 12.5, fontWeight: 600 }}>{it.name}</div>
                  <div style={{ color: '#6b6a80', fontSize: 10.5, marginTop: 1 }}>{it.metaLabel}</div>
                </div>
              ))}
              {q.addOpen && (
                <div onClick={vm.stopProp} style={{ background: '#1B1B29', borderRadius: 10, padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <input value={vm.newPriorityItemName} onChange={vm.onNewPriorityItemNameChange} placeholder="ຊື່ວຽກ..." style={{ width: '100%', background: '#0F0F17', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '6px 8px', color: '#F1EFEA', fontSize: 12, fontFamily: "'Noto Sans Lao',sans-serif", outline: 'none' }} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div onClick={q.cancelAdd} style={{ flex: 1, textAlign: 'center', padding: 6, borderRadius: 8, background: 'rgba(255,255,255,.06)', color: '#9C99AE', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>ຍົກເລີກ</div>
                    <div onClick={q.submitAdd} style={{ flex: 1, textAlign: 'center', padding: 6, borderRadius: 8, background: '#F5B942', color: '#14141F', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>ເພີ່ມ</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ color: '#6b6a80', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>ລາຍການອາທິດນີ້ (ຍັງບໍ່ໄດ້ຈັດລຳດັບ)</div>
      <div onDragOver={vm.onDragOverPriority} onDrop={vm.priorityTrayDrop} style={{ background: '#1B1B29', borderRadius: 16, padding: 14, minHeight: 90, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {vm.priorityTray.map((it) => (
          <div key={it.iid} draggable onDragStart={it.dragStart} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.06)', borderRadius: 100, padding: '6px 12px 6px 8px', cursor: 'grab' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: it.color, flexShrink: 0 }} />
            <div style={{ color: '#F1EFEA', fontSize: 12.5, fontWeight: 500 }}>{it.name}</div>
            <div style={{ color: '#6b6a80', fontSize: 11 }}>{it.metaLabel}</div>
          </div>
        ))}
      </div>
    </>
  );
}
