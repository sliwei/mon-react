import React from 'react';
import { Settings as SettingsIcon, Plus } from 'lucide-react';
import type { UP } from '../types';

interface SidebarProps {
  ups: UP[];
  activeMid: string | null;
  onSelectUP: (mid: string) => void;
  onOpenSettings: () => void;
  onAddUP: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ ups, activeMid, onSelectUP, onOpenSettings, onAddUP }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Bili Monitor</span>
        <button onClick={onOpenSettings} title="Settings">
          <SettingsIcon size={20} />
        </button>
      </div>
      <div className="up-list">
        {ups.map((up) => (
          <div
            key={up.mid}
            className={`up-item ${activeMid === up.mid ? 'active' : ''}`}
            onClick={() => onSelectUP(up.mid)}
          >
            <img src={up.face} alt={up.name} className="up-face" />
            <span className="up-name">{up.name}</span>
          </div>
        ))}
        <button className="up-item add-btn" style={{ width: '100%', border: '1px dashed var(--border-color)', justifyContent: 'center' }} onClick={onAddUP}>
          <Plus size={18} style={{ marginRight: 8 }} />
          <span>添加用户</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
