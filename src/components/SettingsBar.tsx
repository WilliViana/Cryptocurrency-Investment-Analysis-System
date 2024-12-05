import React from 'react';
import { Settings } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { translate } from '../utils/translations';
import { Language, Currency } from '../types/settings';

export const SettingsBar: React.FC = () => {
  const { settings, setLanguage, setCurrency } = useSettings();

  return (
    <div className="bg-white shadow-sm mb-6 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end space-x-4">
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-gray-500" />
            <select
              value={settings.language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
              <option value="en">English</option>
              <option value="pt-BR">Português (BR)</option>
            </select>
            <select
              value={settings.currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
              <option value="USD">USD</option>
              <option value="BRL">BRL</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};