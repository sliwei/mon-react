import { useState } from 'react';
import type { Settings, UP } from '../types';
import { getSettings, saveSettings, getUPs, saveUPs } from '../lib/storage';
import { searchUP } from '../lib/api';
import { Trash2, Save, X, Loader2, Search } from 'lucide-react';

interface SettingsPageProps {
  onClose: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<Settings>(getSettings());
  const [ups, setUps] = useState<UP[]>(getUPs());
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<UP[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = () => {
    saveSettings(settings);
    alert('设置已保存');
  };

  const handleSearch = async () => {
    if (!keyword || !settings.cookie) {
      if (!settings.cookie) alert('请先设置 Cookie');
      return;
    }
    setLoading(true);
    try {
      const results = await searchUP(keyword, settings.cookie);
      setSearchResults(results);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUP = (up: UP) => {
    if (ups.find(u => u.mid === up.mid)) {
      alert('已在列表中');
      return;
    }
    const updatedUps = [...ups, up];
    setUps(updatedUps);
    saveUPs(updatedUps);
  };

  const handleRemoveUP = (mid: string) => {
    const updatedUps = ups.filter(u => u.mid !== mid);
    setUps(updatedUps);
    saveUPs(updatedUps);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-100 flex items-center justify-center">
      <div className="bg-sidebar w-11/12 max-w-200 h-[80vh] flex flex-col rounded-2xl overflow-hidden relative shadow-2xl">
        <button className="absolute right-5 top-5 z-10 p-2 hover:bg-hover rounded-full transition-colors text-text-secondary" onClick={onClose} title="Close">
          <X size={24} />
        </button>
        
        <div className="px-8 py-6 overflow-y-auto flex-1">
          <h2 className="text-xl font-bold mb-6 text-center text-text-primary">设置</h2>

          <section className="bg-card p-5 rounded-xl mb-5 border border-border">
            <h3 className="text-base font-semibold mb-4 text-primary">基础配置</h3>
            <div className="mb-4">
              <label className="block mb-1.5 text-[0.85rem] font-medium text-text-primary">Bilibili Cookie</label>
              <textarea
                className="w-full p-2.5 bg-black/10 border border-border rounded-lg text-text-primary text-sm outline-none focus:border-primary transition-colors"
                value={settings.cookie}
                onChange={(e) => setSettings({ ...settings, cookie: e.target.value })}
                rows={2}
                placeholder="SESSDATA=..."
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1.5 text-[0.85rem] font-medium text-text-primary">获取间隔 (分钟)</label>
              <input
                type="number"
                className="w-full p-2.5 bg-black/10 border border-border rounded-lg text-text-primary text-sm outline-none focus:border-primary transition-colors"
                value={settings.refreshInterval}
                onChange={(e) => setSettings({ ...settings, refreshInterval: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="notify-toggle"
                checked={settings.enableNotifications}
                onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                className="mr-2.5 w-3.5 h-3.5 accent-primary"
              />
              <label htmlFor="notify-toggle" className="text-[0.85rem] cursor-pointer text-text-primary">开启浏览器消息通知</label>
            </div>
            <button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm transition-all hover:opacity-90 active:scale-95 flex items-center gap-1.5" onClick={handleSaveSettings}>
              <Save size={16} />
              保存配置
            </button>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <section className="bg-card p-5 rounded-xl mb-5 border border-border">
              <h3 className="text-base font-semibold mb-4 text-primary">搜索并添加 UP</h3>
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  className="flex-1 p-2.5 bg-black/10 border border-border rounded-lg text-text-primary text-sm outline-none focus:border-primary transition-colors"
                  placeholder="输入昵称关键词"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  disabled={loading}
                />
                <button className="p-2.5 bg-hover text-text-primary rounded-lg transition-all hover:opacity-90 active:scale-95" onClick={handleSearch} disabled={loading || !keyword}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {searchResults.map(up => (
                  <div key={up.mid} className="flex items-center p-2.5 mb-1.5 rounded-lg bg-black/5 border border-transparent">
                    <img src={up.face} className="w-8 h-8 rounded-full mr-2.5 object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[0.85rem] truncate text-text-primary">{up.name}</div>
                      <div className="text-[0.7rem] text-text-secondary">MID: {up.mid}</div>
                    </div>
                    <button className="px-2.5 py-1 bg-primary text-white rounded-md text-[0.75rem] ml-1.5 hover:opacity-90 transition-opacity" onClick={() => handleAddUP(up)}>
                      添加
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-card p-5 rounded-xl mb-5 border border-border">
              <h3 className="text-base font-semibold mb-4 text-primary">已添加列表</h3>
              <div className="max-h-75 overflow-y-auto">
                {ups.length === 0 && <div className="text-text-secondary text-center py-4 text-sm">暂无 UP</div>}
                {ups.map(up => (
                  <div key={up.mid} className="flex items-center p-2.5 mb-1.5 rounded-lg transition-colors hover:bg-hover">
                    <img src={up.face} className="w-8 h-8 rounded-full mr-2.5 object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[0.85rem] truncate text-text-primary">{up.name}</div>
                      <div className="text-[0.7rem] text-text-secondary">MID: {up.mid}</div>
                    </div>
                    <button onClick={() => handleRemoveUP(up.mid)} className="text-red-500 hover:text-red-600 transition-colors shrink-0 ml-1.5">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
