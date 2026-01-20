import React from 'react';
import { Settings as SettingsIcon, Plus, Moon, Sun } from 'lucide-react';
import type { UP } from '../types';

interface SidebarProps {
  ups: UP[];
  activeMid: string | null;
  onSelectUP: (mid: string) => void;
  onOpenSettings: () => void;
  onAddUP: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  ups, 
  activeMid, 
  onSelectUP, 
  onOpenSettings, 
  onAddUP,
  theme,
  onToggleTheme 
}) => {
  return (
    <aside className="w-60 bg-sidebar border-r border-border flex flex-col transition-all duration-300">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <span className="text-lg font-bold text-primary">Bili Monitor</span>
        <div className="flex gap-1">
          <button onClick={onToggleTheme} title="Toggle Theme" className="p-1.5 hover:bg-hover rounded-md transition-colors text-text-secondary">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={onOpenSettings} title="Settings" className="p-1.5 hover:bg-hover rounded-md transition-colors text-text-secondary">
            <SettingsIcon size={18} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {ups.map((up) => (
          <div
            key={up.mid}
            className={`flex items-center p-2 mb-1.5 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-hover ${
              activeMid === up.mid ? 'bg-primary/10 border border-primary/40' : 'border border-transparent'
            }`}
            onClick={() => onSelectUP(up.mid)}
          >
            <img src={up.face} alt={up.name} className="w-8 h-8 rounded-full mr-2.5 object-cover" />
            <span className="font-medium text-[0.9rem] truncate">{up.name}</span>
          </div>
        ))}
        <button 
          className="flex items-center justify-center w-full p-2 mt-1.5 rounded-lg cursor-pointer transition-colors duration-200 border border-dashed border-border hover:bg-hover text-sm text-text-secondary"
          onClick={onAddUP}
        >
          <Plus size={16} className="mr-1.5" />
          <span>添加用户</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
