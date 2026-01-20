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
    <div className="overlay">
      <div className="settings-container" style={{ background: 'var(--sidebar-bg)', width: '90%', maxWidth: '800px', height: '80vh', display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
        <button className="btn" onClick={onClose} style={{ position: 'absolute', right: 20, top: 20, zIndex: 10 }}>
          <X size={24} />
        </button>
        
        <div style={{ padding: '30px 40px', overflowY: 'auto', flex: 1 }}>
          <h2 style={{ marginBottom: 30, textAlign: 'center' }}>设置</h2>

          <section className="settings-section">
            <h3>基础配置</h3>
            <div className="form-group">
              <label>Bilibili Cookie</label>
              <textarea
                className="form-control"
                value={settings.cookie}
                onChange={(e) => setSettings({ ...settings, cookie: e.target.value })}
                rows={3}
                placeholder="SESSDATA=..."
              />
            </div>
            <div className="form-group">
              <label>获取间隔 (分钟)</label>
              <input
                type="number"
                className="form-control"
                value={settings.refreshInterval}
                onChange={(e) => setSettings({ ...settings, refreshInterval: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="notify-toggle"
                checked={settings.enableNotifications}
                onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                style={{ marginRight: 10 }}
              />
              <label htmlFor="notify-toggle" style={{ margin: 0 }}>开启浏览器消息通知</label>
            </div>
            <button className="btn btn-primary" onClick={handleSaveSettings}>
              <Save size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              保存配置
            </button>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <section className="settings-section">
              <h3>搜索并添加 UP</h3>
              <div className="form-group" style={{ display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="输入昵称关键词"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  disabled={loading}
                />
                <button className="btn btn-secondary" onClick={handleSearch} disabled={loading || !keyword}>
                  {loading ? <Loader2 size={18} className="spin" /> : <Search size={18} />}
                </button>
              </div>
              <div className="search-results" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {searchResults.map(up => (
                  <div key={up.mid} className="up-item" style={{ background: 'rgba(0,0,0,0.1)', cursor: 'default' }}>
                    <img src={up.face} className="up-face" />
                    <div style={{ flex: 1 }}>
                      <div className="up-name">{up.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>MID: {up.mid}</div>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => handleAddUP(up)}>
                      添加
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="settings-section">
              <h3>已添加列表</h3>
              <div className="up-list" style={{ padding: 0, maxHeight: '380px', overflowY: 'auto' }}>
                {ups.length === 0 && <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>暂无 UP</div>}
                {ups.map(up => (
                  <div key={up.mid} className="up-item" style={{ cursor: 'default' }}>
                    <img src={up.face} className="up-face" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="up-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{up.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>MID: {up.mid}</div>
                    </div>
                    <button onClick={() => handleRemoveUP(up.mid)} style={{ color: '#ff4d4f', flexShrink: 0 }}>
                      <Trash2 size={18} />
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
