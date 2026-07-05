export default function DashboardView({ vm }) {
  return (
    <>
      <div style={{ color: '#9C99AE', fontSize: 13, marginBottom: 14 }}>{vm.todayLabel}</div>

      <div style={{ display: 'flex', background: '#1B1B29', borderRadius: 100, padding: 4, marginBottom: 14, maxWidth: 420 }}>
        {vm.viewLabels.map((vl) => (
          <div key={vl.id} onClick={vl.select} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 100, background: vl.bg, color: vl.color, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>{vl.label}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ background: '#1B1B29', borderRadius: 24, padding: '20px 8px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg width="340" height="340" viewBox="0 0 340 340">
            {vm.starSpokes.map((sp, i) => (
              <line key={i} x1={sp.x1} y1={sp.y1} x2={sp.x2} y2={sp.y2} stroke="rgba(255,255,255,.08)" strokeWidth="1.5" />
            ))}
            {vm.catPetals.map((pt) => (
              <path key={pt.id + '-pale'} d={pt.palePath} fill={pt.paleFill} stroke="none" />
            ))}
            {vm.catPetals.map((pt) => (
              <path key={pt.id + '-actual'} d={pt.actualPath} fill={pt.actualFill} stroke={pt.strokeColor} strokeWidth="1.5" strokeLinejoin="round" />
            ))}
            {vm.starMarkers.map((mk, i) => (
              <circle key={i} cx={mk.x} cy={mk.y} r="7" fill={mk.color} stroke="#14141F" strokeWidth="2" />
            ))}
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {vm.catStats.map((cat) => (
            <div key={cat.id} onClick={cat.openDetail} style={{ background: '#1B1B29', borderRadius: 18, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Prompt','Noto Sans Lao',sans-serif", fontWeight: 700, color: '#14141F', fontSize: 17, flexShrink: 0 }}>{cat.letter}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#F1EFEA', fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</div>
                <div style={{ background: 'rgba(255,255,255,.08)', height: 6, borderRadius: 100, marginTop: 7, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 100, background: cat.color, width: cat.pctBarWidth }} />
                </div>
              </div>
              <div style={{ color: '#F1EFEA', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{cat.pctLabel}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
