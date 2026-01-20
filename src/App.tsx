import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import SettingsPage from './components/SettingsPage';
import DynamicCard from './components/DynamicCard';
import type { UP, Settings, DynamicContent } from './types';
import { getSettings, getUPs } from './lib/storage';
import { fetchDynamics } from './lib/api';
import { Bell, RefreshCw } from 'lucide-react';

function App() {
  const [ups, setUps] = useState<UP[]>(getUPs());
  const [settings, setSettings] = useState<Settings>(getSettings());
  const [activeMid, setActiveMid] = useState<string | null>(null);
  const [dynamics, setDynamics] = useState<DynamicContent[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastCheckedMap, setLastCheckedMap] = useState<Record<string, number>>({});
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const refreshData = useCallback(async (mid: string) => {
    if (!mid || !settings.cookie) return;
    setLoading(true);
    const data = await fetchDynamics(mid, settings.cookie);
    setDynamics(data);
    setLoading(false);
    
    // Notification logic
    if (settings.enableNotifications && data.length > 0) {
      const latest = data[0];
      const lastChecked = lastCheckedMap[mid] || 0;
      if (latest.timestamp > lastChecked) {
        if (Notification.permission === 'granted') {
          new Notification(`Bili Monitor: ${ups.find(u => u.mid === mid)?.name}`, {
            body: latest.title || latest.description,
            icon: ups.find(u => u.mid === mid)?.face
          });
        }
        setLastCheckedMap(prev => ({ ...prev, [mid]: latest.timestamp }));
      }
    }
  }, [settings.cookie, settings.enableNotifications, lastCheckedMap, ups]);

  useEffect(() => {
    if (activeMid) {
      // Use a microtask to avoid synchronous setState warning
      const task = async () => {
        await refreshData(activeMid);
      };
      task();
    }
  }, [activeMid, refreshData]);

  // Global refresh interval
  useEffect(() => {
    if (ups.length === 0 || !settings.cookie) return;

    const interval = setInterval(() => {
      ups.forEach(up => {
        refreshData(up.mid);
      });
    }, settings.refreshInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [ups, settings.cookie, settings.refreshInterval, refreshData]);

  // Request notification permission
  useEffect(() => {
    if (settings.enableNotifications && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [settings.enableNotifications]);

  const activeUP = ups.find(u => u.mid === activeMid);

  return (
    <div className="flex h-screen w-screen bg-bg text-text-primary overflow-hidden">
      <Sidebar
        ups={ups}
        activeMid={activeMid}
        onSelectUP={setActiveMid}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onAddUP={() => setIsSettingsOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 flex flex-col bg-main">
        <header className="h-14 px-5 flex justify-between items-center bg-glass backdrop-blur-md border-b border-border z-10">
          <div className="flex items-center">
            <h2 className="text-[1.1rem] font-bold">
              {activeUP ? `${activeUP.name} 的动态` : '请选择或添加 UP 主'}
            </h2>
            {loading && <RefreshCw size={16} className="animate-spin ml-2.5" />}
          </div>
          <div className="flex gap-3">
            {settings.enableNotifications && <Bell size={18} className="text-primary" />}
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4">
          {activeMid ? (
            dynamics.length > 0 ? (
              dynamics.map(dyn => <DynamicCard key={dyn.id} dynamic={dyn} />)
            ) : (
              <div className="text-center mt-20 text-text-secondary text-sm">
                {loading ? '正在获取动态...' : '暂无动态或获取失败'}
              </div>
            )
          ) : (
            <div className="text-center mt-20 text-text-secondary text-sm">
              请在左侧选择一个 UP 主，或点击设置添加
            </div>
          )}
        </section>
      </main>

      {isSettingsOpen && (
        <SettingsPage onClose={() => {
          setIsSettingsOpen(false);
          setUps(getUPs());
          setSettings(getSettings());
        }} />
      )}
    </div>
  );
}

export default App;
