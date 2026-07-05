import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AuthScreen() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [msgColor, setMsgColor] = useState('#E8555A');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email.trim() || !password) { setMsg('ກະລຸນາປ້ອນອີເມວ ແລະ ລະຫັດຜ່ານ'); setMsgColor('#E8555A'); return; }
    setBusy(true);
    setMsg('');
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) { setMsg(error.message); setMsgColor('#E8555A'); }
    } else {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) { setMsg(error.message); setMsgColor('#E8555A'); }
      else { setMsg('ສະໝັກສຳເລັດ! ກວດອີເມວເພື່ອຢືນຢັນ (ຫຼືເຂົ້າສູ່ລະບົບໄດ້ເລີຍຖ້າບໍ່ໄດ້ເປີດການຢືນຢັນ)'); setMsgColor('#4CD97B'); }
    }
    setBusy(false);
  }

  return (
    <div style={{ height: '100vh', width: '100%', background: '#0A0A11', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Sans Lao',sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 360, background: '#14141F', borderRadius: 24, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontFamily: "'Prompt','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 20, color: '#F1EFEA', textAlign: 'center' }}>Mone's Secretory</div>

        <div style={{ display: 'flex', background: '#1B1B29', borderRadius: 100, padding: 4 }}>
          <div onClick={() => { setMode('signin'); setMsg(''); }} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 100, background: mode === 'signin' ? '#F5B942' : 'transparent', color: mode === 'signin' ? '#14141F' : '#5D5A6B', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>ເຂົ້າສູ່ລະບົບ</div>
          <div onClick={() => { setMode('signup'); setMsg(''); }} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 100, background: mode === 'signup' ? '#F5B942' : 'transparent', color: mode === 'signup' ? '#14141F' : '#5D5A6B', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>ສະໝັກໃໝ່</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ color: '#8B899C', fontSize: 12 }}>ອີເມວ</div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: '100%', background: '#0F0F17', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: '10px 12px', color: '#F1EFEA', fontSize: 14, outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ color: '#8B899C', fontSize: 12 }}>ລະຫັດຜ່ານ</div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="••••••••" style={{ width: '100%', background: '#0F0F17', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: '10px 12px', color: '#F1EFEA', fontSize: 14, outline: 'none' }} />
        </div>

        {msg && <div style={{ fontSize: 12.5, color: msgColor, lineHeight: 1.5 }}>{msg}</div>}

        <div onClick={busy ? undefined : submit} style={{ textAlign: 'center', padding: 12, borderRadius: 12, background: busy ? 'rgba(245,185,66,.5)' : '#F5B942', color: '#14141F', fontSize: 14, fontWeight: 700, cursor: busy ? 'default' : 'pointer' }}>
          {busy ? '...' : (mode === 'signin' ? 'ເຂົ້າສູ່ລະບົບ' : 'ສະໝັກໃໝ່')}
        </div>
      </div>
    </div>
  );
}
