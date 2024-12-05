import React from 'react';
import { CryptoCard } from './CryptoCard';
import { CryptoData } from '../types/crypto';

interface DashboardProps {
  cryptoData: CryptoData[];
  isLoading: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ cryptoData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cryptoData.map((crypto) => (
        <CryptoCard key={crypto.id} crypto={crypto} />
      ))}
    </div>
  );
};