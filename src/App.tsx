import React from 'react';
import { Coins } from 'lucide-react';
import { SignalGenerator } from './components/SignalGenerator';
import { WalletProvider } from './context/WalletContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';


const AppContent: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Coins className="h-8 w-8 text-blue-500 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">
              {settings.language === 'pt-BR'
                ? 'Gerador de Sinais de Trade'
                : 'Trade Signal Generator'}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SignalGenerator />
      </main>
    </div>
  );
};

function App() {
  return (
    <SettingsProvider>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </SettingsProvider>
  );
}

export default App;