import React, { createContext, useContext, useState } from 'react';
import { Settings, Language, Currency } from '../types/settings';

interface SettingsContextType {
  settings: Settings;
  setLanguage: (language: Language) => void;
  setCurrency: (currency: Currency) => void;
}

const defaultSettings: Settings = {
  language: 'en',
  currency: 'USD',
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const setLanguage = (language: Language) => {
    setSettings(prev => ({ ...prev, language }));
  };

  const setCurrency = (currency: Currency) => {
    setSettings(prev => ({ ...prev, currency }));
  };

  return (
    <SettingsContext.Provider value={{ settings, setLanguage, setCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};