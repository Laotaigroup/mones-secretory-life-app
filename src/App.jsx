import { useEffect, useState } from 'react';
import { useAppState } from './useAppState';
import { supabase } from './supabaseClient';
import AuthScreen from './components/AuthScreen';
import DashboardView from './components/DashboardView';
import TodayView from './components/TodayView';
import CategoriesView from './components/CategoriesView';
import PlannerView from './components/PlannerView';
import PriorityView from './components/PriorityView';
import WorkoutView from './components/WorkoutView';

const SYNC_LABEL = { idle: '', loading: 'ກຳລັງໂຫຼດ...', saving: 'ກຳລັງບັນທຶກ...', saved: 'ບັນທຶກແລ້ວ', error: 'ບັນທຶກບໍ່ສຳເລັດ' };

const navItems = [
  { key: 'dashboard', label: 'ພາບລວມ', go: 'goDashboard', icon: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.9-6.2 3.9 1.6-7L2 9.2l7.1-.6z" fill={c} /></svg>
  ) },
  { key: 'today', label: 'ມື້ນີ້', go: 'goToday', icon: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 12l5 5L20 6" stroke={c} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ) },
  { key: 'categories', label: 'ໝວດໝູ່', go: 'goCategories', icon: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="2" fill={c} /><rect x="13" y="3" width="8" height="8" rx="2" fill={c} /><rect x="3" y="13" width="8" height="8" rx="2" fill={c} /><rect x="13" y="13" width="8" height="8" rx="2" fill={c} /></svg>
  ) },
  { key: 'planner', label: 'ແຜນລາຍອາທິດ', go: 'goPlanner', fontSize: 12.5, icon: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="3" stroke={c} strokeWidth="2" fill="none" /><path d="M3 9h18" stroke={c} strokeWidth="2" /><path d="M8 2v4M16 2v4" stroke={c} strokeWidth="2" strokeLinecap="round" /></svg>
  ) },
  { key: 'priority', label: 'ຈັດລຳດັບຄວາມສຳຄັນ', go: 'goPriority', fontSize: 12, icon: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.9-6.2 3.9 1.6-7L2 9.2l7.1-.6z" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" /></svg>
  ) },
  { key: 'workout', label: 'ອອກກຳລັງກາຍ', go: 'goWorkout', fontSize: 12.5, icon: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 12h2M18 12h2M6 8v8M18 8v8M8 12h8" stroke={c} strokeWidth="2.4" strokeLinecap="round" /></svg>
  ) },
];

export default function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const vm = useAppState(session?.user?.id);

  if (session === undefined) {
    return <div style={{ height: '100vh', width: '100%', background: '#0A0A11' }} />;
  }
  if (!session) {
    return <AuthScreen />;
  }

  return (
    <div style={{ height: '100vh', width: '100%', background: '#0A0A11', display: 'flex', fontFamily: "'Noto Sans Lao',sans-serif", overflow: 'hidden', lineHeight: 1.7 }}>
      <div style={{ width: 246, flexShrink: 0, background: '#14141F', borderRight: '1px solid rgba(255,255,255,.06)', display: 'flex', flexDirection: 'column', padding: '22px 14px' }}>
        <div style={{ fontFamily: "'Prompt','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 16.5, color: '#F1EFEA', letterSpacing: '.01em', padding: '2px 10px 22px' }}>Mone's Secretory</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {navItems.map((item) => (
            <div key={item.key} onClick={vm[item.go]} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 12, cursor: 'pointer', background: vm.navBg[item.key] }}>
              {item.icon(vm.navColors[item.key])}
              <div style={{ color: vm.navColors[item.key], fontSize: item.fontSize || 13.5, fontWeight: 600, whiteSpace: 'nowrap' }}>{item.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1F1F2E', padding: '10px 14px', borderRadius: 14 }}>
            <span style={{ fontSize: 16, animation: 'flamePulse 1.6s ease-in-out infinite' }}>🔥</span>
            <span style={{ color: '#F5B942', fontSize: 13.5, fontWeight: 700 }}>{vm.streakDays} ວັນຕິດຕໍ່ກັນ</span>
          </div>
          <div style={{ background: '#1F1F2E', padding: '10px 14px', borderRadius: 14, color: '#9C99AE', fontSize: 12.5, fontWeight: 700 }}>Level {vm.level}</div>
          {SYNC_LABEL[vm.syncStatus] && (
            <div style={{ textAlign: 'center', color: vm.syncStatus === 'error' ? '#E8555A' : '#6b6a80', fontSize: 11 }}>{SYNC_LABEL[vm.syncStatus]}</div>
          )}
          <div onClick={vm.onLogout} style={{ textAlign: 'center', padding: '8px 14px', borderRadius: 14, color: '#8B899C', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>ອອກຈາກລະບົບ</div>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ padding: '26px 40px 18px', borderBottom: '1px solid rgba(255,255,255,.06)', flexShrink: 0 }}>
          <div style={{ fontFamily: "'Prompt','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 23, color: '#F1EFEA', letterSpacing: '.01em' }}>{vm.tabTitle}</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px 40px' }}>
          {vm.tabIsDashboard && <DashboardView vm={vm} />}
          {vm.tabIsToday && <TodayView vm={vm} />}
          {vm.tabIsCategories && <CategoriesView vm={vm} />}
          {vm.tabIsPlanner && <PlannerView vm={vm} />}
          {vm.tabIsPriority && <PriorityView vm={vm} />}
          {vm.tabIsWorkout && <WorkoutView vm={vm} />}
        </div>
      </div>
    </div>
  );
}
