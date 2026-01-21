import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SettingsPage from './components/SettingsPage';
import DynamicCard from './components/DynamicCard';
import type { UP, Settings, DynamicContent } from './types';
import { getSettings, getUPs, getStoredDynamics } from './lib/storage';
import { pollingService } from './lib/polling';
import { Bell, RefreshCw } from 'lucide-react';

function App() {
  const [ups, setUps] = useState<UP[]>(getUPs());
  const [settings, setSettings] = useState<Settings>(getSettings());
  const [activeMid, setActiveMid] = useState<string | null>(null);
  const [dynamicsMap, setDynamicsMap] = useState<Record<string, DynamicContent[]>>(getStoredDynamics());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Subscribe to PollingService
  useEffect(() => {
    // Start service if not started or just ensure it's running with current settings
    pollingService.start();

    const unsubscribe = pollingService.subscribe(() => {
      setDynamicsMap(getStoredDynamics());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleManualRefresh = () => {
    pollingService.forceRefreshDynamics();
  };

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
            <button 
              onClick={handleManualRefresh}
              className="ml-3 p-1.5 rounded-full hover:bg-hover active:scale-95 transition"
              title="手动刷新动态"
            >
              <RefreshCw size={16} />
            </button>
          </div>
          <div className="flex gap-3">
            {settings.enableNotifications && <Bell size={18} className="text-primary" />}
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 relative">
          {!activeMid && (
            <div className="text-center mt-20 text-text-secondary text-sm">
              请在左侧选择一个 UP 主，或点击设置添加
            </div>
          )}
          
          {ups.map(up => {
            const upDynamics = dynamicsMap[up.mid] || [];
            const isActive = activeMid === up.mid;
            
            return (
              <div 
                key={up.mid} 
                style={{ display: isActive ? 'block' : 'none' }}
                className="w-full"
              >
                {upDynamics.length > 0 ? (
                  upDynamics.map(dyn => <DynamicCard key={dyn.id} dynamic={dyn} />)
                ) : (
                  <div className="text-center mt-20 text-text-secondary text-sm">
                    暂无动态，请检查设置并确保轮询已开启
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </main>

      {isSettingsOpen && (
        <SettingsPage onClose={() => {
          setIsSettingsOpen(false);
          setUps(getUPs());
          setSettings(getSettings());
          // Restart polling service to apply new settings immediately
          pollingService.restart();
        }} />
      )}
    </div>
  );
}

export default App;
