import { useState } from 'react';

function ItemCard({ it }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div draggable onDragStart={it.dragStart} style={{ background: '#1B1B29', borderLeft: `3px solid ${it.color}`, borderRadius: 8, padding: '7px 10px', cursor: 'grab' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: '#F1EFEA', fontSize: 12.5, fontWeight: 600 }}>{it.name}</div>
          <div style={{ color: '#6b6a80', fontSize: 10.5, marginTop: 1 }}>{it.metaLabel}</div>
        </div>
        <div
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
          title="ຍ້າຍໄປຊ່ອງອື່ນ"
          style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: '#8B899C', fontSize: 13, lineHeight: 1 }}
        >⋯</div>
      </div>
      {menuOpen && (
        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 7 }}>
          {it.moveOptions.map((opt) => (
            <div
              key={opt.id || 'none'}
              onClick={() => { opt.select(); setMenuOpen(false); }}
              style={{ width: 26, height: 26, borderRadius: '50%', background: opt.active ? opt.color : 'rgba(255,255,255,.06)', border: `1.5px solid ${opt.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 9, color: opt.active ? '#14141F' : opt.color, fontWeight: 700 }}
            >{opt.stars}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PriorityView({ vm, isMobile }) {
  return (
    <>
      <div style={{ color: '#8B899C', fontSize: 13, marginBottom: 14 }}>ລາກລາຍການຈາກລຸ່ມໄປວາງໃນຊ່ອງທີ່ເໝາະສົມ (ຫຼືກົດ ⋯ ເພື່ອຍ້າຍ) · ລະບົບຈະໃຫ້ດາວຄວາມສຳຄັນອັດຕະໂນມັດ</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 8 : 14, marginBottom: 20 }}>
        {vm.priorityQuadrants.map((q) => (
          <div key={q.id} onDragOver={vm.onDragOverPriority} onDrop={q.onDrop} onClick={q.onBoxClick} style={{ background: 'rgba(255,255,255,.03)', border: `1.5px solid ${q.color}`, borderRadius: 16, padding: isMobile ? 10 : 14, minHeight: 140, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <div style={{ color: '#F1EFEA', fontSize: 13.5, fontWeight: 700 }}>{q.title}</div>
              <div style={{ color: q.color, fontSize: 13, letterSpacing: 1 }}>{q.stars}</div>
            </div>
            <div style={{ color: '#6b6a80', fontSize: 11.5, marginBottom: 10 }}>{q.sub}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {q.items.map((it) => <ItemCard key={it.iid} it={it} />)}
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
          <TrayItem key={it.iid} it={it} />
        ))}
      </div>
    </>
  );
}

function TrayItem({ it }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <div draggable onDragStart={it.dragStart} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.06)', borderRadius: 100, padding: '6px 12px 6px 8px', cursor: 'grab' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: it.color, flexShrink: 0 }} />
        <div style={{ color: '#F1EFEA', fontSize: 12.5, fontWeight: 500 }}>{it.name}</div>
        <div style={{ color: '#6b6a80', fontSize: 11 }}>{it.metaLabel}</div>
        <div
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
          title="ຍ້າຍໄປຊ່ອງ"
          style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: '#8B899C', fontSize: 11, lineHeight: 1 }}
        >⋯</div>
      </div>
      {menuOpen && (
        <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, display: 'flex', gap: 5, background: '#22223A', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: 6, zIndex: 20, boxShadow: '0 4px 14px rgba(0,0,0,.3)' }}>
          {it.moveOptions.filter((opt) => opt.id).map((opt) => (
            <div
              key={opt.id}
              onClick={() => { opt.select(); setMenuOpen(false); }}
              style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,.06)', border: `1.5px solid ${opt.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 9, color: opt.color, fontWeight: 700 }}
            >{opt.stars}</div>
          ))}
        </div>
      )}
    </div>
  );
}
