import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { CryptoData } from '../types/crypto';

interface WalletManagerProps {
  cryptoData: CryptoData[];
}

export const WalletManager: React.FC<WalletManagerProps> = ({ cryptoData }) => {
  const { state, dispatch } = useWallet();
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');

  const handleAddInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrypto || !investmentAmount) return;

    const crypto = cryptoData.find(c => c.id === selectedCrypto);
    if (!crypto) return;

    const amount = parseFloat(investmentAmount);
    const coinAmount = amount / crypto.current_price;

    dispatch({
      type: 'ADD_HOLDING',
      payload: {
        cryptoId: selectedCrypto,
        amount: coinAmount,
        initialInvestment: amount,
      },
    });

    setSelectedCrypto('');
    setInvestmentAmount('');
  };

  const calculateTotalValue = () => {
    return state.holdings.reduce((total, holding) => {
      const crypto = cryptoData.find(c => c.id === holding.cryptoId);
      if (!crypto) return total;
      return total + (holding.amount * crypto.current_price);
    }, 0);
  };

  const totalValue = calculateTotalValue();
  const profitLoss = totalValue - state.totalInvestment;
  const profitLossPercentage = (profitLoss / state.totalInvestment) * 100 || 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center mb-6">
        <Wallet className="h-6 w-6 text-blue-500 mr-2" />
        <h2 className="text-xl font-semibold">Your Wallet</h2>
      </div>

      <form onSubmit={handleAddInvestment} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedCrypto}
            onChange={(e) => setSelectedCrypto(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          >
            <option value="">Select Cryptocurrency</option>
            {cryptoData.map((crypto) => (
              <option key={crypto.id} value={crypto.id}>
                {crypto.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(e.target.value)}
            placeholder="Investment amount (USD)"
            min="0"
            step="0.01"
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          />

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Add Investment
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm text-gray-600 mb-1">Total Investment</h3>
          <p className="text-lg font-semibold">${state.totalInvestment.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm text-gray-600 mb-1">Current Value</h3>
          <p className="text-lg font-semibold">${totalValue.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm text-gray-600 mb-1">Profit/Loss</h3>
          <p className={`text-lg font-semibold ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${profitLoss.toLocaleString()} ({profitLossPercentage.toFixed(2)}%)
          </p>
        </div>
      </div>

      {state.holdings.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Cryptocurrency</th>
                <th className="text-right py-2">Amount</th>
                <th className="text-right py-2">Initial Investment</th>
                <th className="text-right py-2">Current Value</th>
                <th className="text-right py-2">Profit/Loss</th>
                <th className="text-right py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.holdings.map((holding) => {
                const crypto = cryptoData.find(c => c.id === holding.cryptoId);
                if (!crypto) return null;
                
                const currentValue = holding.amount * crypto.current_price;
                const holdingProfitLoss = currentValue - holding.initialInvestment;
                const holdingProfitLossPercentage = (holdingProfitLoss / holding.initialInvestment) * 100;

                return (
                  <tr key={holding.cryptoId} className="border-b">
                    <td className="py-2">{crypto.name}</td>
                    <td className="text-right">{holding.amount.toFixed(8)} {crypto.symbol.toUpperCase()}</td>
                    <td className="text-right">${holding.initialInvestment.toLocaleString()}</td>
                    <td className="text-right">${currentValue.toLocaleString()}</td>
                    <td className={`text-right ${holdingProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${holdingProfitLoss.toLocaleString()} ({holdingProfitLossPercentage.toFixed(2)}%)
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_HOLDING', payload: holding.cryptoId })}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};