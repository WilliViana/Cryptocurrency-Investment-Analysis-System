import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { CryptoData } from '../types/crypto';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../utils/currency';

interface CryptoCardProps {
  crypto: CryptoData;
}

export const CryptoCard: React.FC<CryptoCardProps> = ({ crypto }) => {
  const { settings } = useSettings();
  const isPositive = crypto.price_change_percentage_24h > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">{crypto.name}</h3>
        <span className="text-gray-500 uppercase">{crypto.symbol}</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">
            {settings.language === 'pt-BR' ? 'Preço:' : 'Price:'}
          </span>
          <span className="font-medium">
            {formatCurrency(crypto.current_price, settings.currency)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">
            {settings.language === 'pt-BR' ? 'Variação 24h:' : '24h Change:'}
          </span>
          <span className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">
            {settings.language === 'pt-BR' ? 'Cap. de Mercado:' : 'Market Cap:'}
          </span>
          <span className="font-medium">
            {formatCurrency(crypto.market_cap, settings.currency)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">
            {settings.language === 'pt-BR' ? 'Volume:' : 'Volume:'}
          </span>
          <span className="font-medium">
            {formatCurrency(crypto.total_volume, settings.currency)}
          </span>
        </div>
      </div>
    </div>
  );
};