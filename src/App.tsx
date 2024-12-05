import React, { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { WalletManager } from './components/WalletManager';
import { SettingsBar } from './components/SettingsBar';
import { WalletProvider } from './context/WalletContext';
import { SettingsProvider } from './context/SettingsContext';
import { getCryptoData } from './services/api';
import { CryptoData } from './types/crypto';
import { useSettings } from './context/SettingsContext';

const AppContent: React.FC = () => {
  const { settings } = useSettings();
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getCryptoData(settings.currency);
        
        if (mounted && data.length > 0) {
          setCryptoData(data);
        } else if (mounted && data.length === 0) {
          setError('Unable to fetch cryptocurrency data. Please try again later.');
        }
      } catch (err) {
        if (mounted) {
          setError('An error occurred while fetching data.');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute

    return () => {
      mounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, [settings.currency]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Coins className="h-8 w-8 text-blue-500 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">
              {settings.language === 'pt-BR' ? 'Sistema de Análise de Criptomoedas' : 'Crypto Analysis System'}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SettingsBar />
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
            {error}
          </div>
        ) : (
          <>
            <WalletManager cryptoData={cryptoData} />
            <Dashboard cryptoData={cryptoData} isLoading={isLoading} />
          </>
        )}
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