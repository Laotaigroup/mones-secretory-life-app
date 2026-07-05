export default function CategoriesView({ vm }) {
  if (vm.categoryListOpen) {
    return (
      <>
        <div style={{ color: '#9C99AE', fontSize: 13, marginBottom: 14 }}>ກົດເພື່ອເບິ່ງລາຍລະອຽດ ແລະ ປະຫວັດ</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {vm.catStats.map((cat) => (
            <div key={cat.id} onClick={cat.openDetail} style={{ background: '#1B1B29', borderRadius: 20, padding: 16, cursor: 'pointer' }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Prompt','Noto Sans Lao',sans-serif", fontWeight: 700, color: '#14141F', fontSize: 15 }}>{cat.letter}</div>
              <div style={{ color: '#F1EFEA', fontSize: 14, fontWeight: 600, lineHeight: 1.3, marginTop: 10, minHeight: 36, display: 'flex', alignItems: 'flex-start' }}>{cat.name}</div>
              <div style={{ color: '#6b6a80', fontSize: 11.5, marginTop: 2 }}>{cat.sub}</div>
              <div style={{ color: '#F1EFEA', fontWeight: 700, fontSize: 22, marginTop: 10, fontFamily: "'Prompt','Noto Sans Lao',sans-serif" }}>{cat.pctLabel}</div>
            </div>
          ))}
        </div>
      </>
    );
  }

  const sc = vm.selectedCategory;
  if (!sc) return null;
  return (
    <div style={{ maxWidth: 720 }}>
      <div onClick={vm.closeCategory} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8B899C', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', marginBottom: 14 }}>
        <svg width="7" height="12" viewBox="0 0 7 12"><path d="M6 1L1 6l5 5" stroke="#8B899C" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        ໝວດໝູ່ທັງໝົດ
      </div>
      <div style={{ background: sc.color, borderRadius: 22, padding: 20, marginBottom: 16 }}>
        <div style={{ fontFamily: "'Prompt','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 22, color: '#14141F' }}>{sc.letter} · {sc.name}</div>
        <div style={{ color: 'rgba(20,20,31,.7)', fontSize: 13, marginTop: 2 }}>{sc.sub} · {sc.note}</div>
        <div style={{ fontFamily: "'Prompt','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 34, color: '#14141F', marginTop: 12 }}>{sc.pctLabel}</div>
        <div style={{ color: 'rgba(20,20,31,.7)', fontSize: 12.5, marginTop: 2 }}>ເຮັດແລ້ວ {sc.progress} / {sc.target} ຄັ້ງເດືອນນີ້</div>
      </div>

      <div style={{ color: '#6b6a80', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>ກິດຈະກຳໃນໝວດນີ້</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {sc.tasks.map((task) => (
          <div key={task.id} style={{ background: '#1B1B29', borderRadius: 16, padding: '12px 14px' }}>
            <div style={{ color: '#F1EFEA', fontSize: 14, fontWeight: 600 }}>{task.name}</div>
            <div style={{ color: '#8B899C', fontSize: 12.5, marginTop: 2 }}>{task.detail} · {task.freqLabel}</div>
          </div>
        ))}
      </div>

      <div style={{ color: '#6b6a80', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>ຍ້ອນຫຼັງ 6 ເດືອນ</div>
      <div style={{ background: '#1B1B29', borderRadius: 18, padding: 16, display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
        {vm.categoryHistory.map((hist, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', borderRadius: 6, background: sc.color, height: hist.barHeight, minHeight: 3 }} />
            <div style={{ color: '#6b6a80', fontSize: 10.5 }}>{hist.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
