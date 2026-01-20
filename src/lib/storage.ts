import type { UP, Settings } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'bili_monitor_settings',
  UPS: 'bili_monitor_ups',
};

const DEFAULT_SETTINGS: Settings = {
  cookie: '',
  refreshInterval: 5,
  enableNotifications: true,
};

export const getSettings = (): Settings => {
  const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
};

export const saveSettings = (settings: Settings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const getUPs = (): UP[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.UPS);
  return saved ? JSON.parse(saved) : [];
};

export const saveUPs = (ups: UP[]) => {
  localStorage.setItem(STORAGE_KEYS.UPS, JSON.stringify(ups));
};

export const addUP = (up: UP) => {
  const ups = getUPs();
  if (!ups.find(u => u.mid === up.mid)) {
    saveUPs([...ups, up]);
  }
};

export const removeUP = (mid: string) => {
  const ups = getUPs();
  saveUPs(ups.filter(u => u.mid !== mid));
};
