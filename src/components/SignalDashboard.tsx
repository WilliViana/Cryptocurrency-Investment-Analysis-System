import React from 'react';
import { TradeSignal } from '../types/trade';
import { ArrowUpRight, ArrowDownRight, Target, XCircle } from 'lucide-react';

interface SignalDashboardProps {
  signals: TradeSignal[];
}

export const SignalDashboard: React.FC<SignalDashboardProps> = ({ signals }) => {
  if (signals.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 text-center text-gray-500">
        <p>Nenhum sinal de trade gerado ainda.</p>
        <p className="text-sm mt-2">Clique em "Gerar Sinal" para analisar o mercado.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <h2 className="text-xl font-bold text-gray-800 p-4 border-b">Sinais de Trade Gerados</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ativo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Direção</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço de Entrada</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Take Profit</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stop Loss</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Justificativa</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {signals.map((signal) => (
              <tr key={signal.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="font-bold text-gray-900">{signal.asset}</span>
                    <span className="ml-2 text-xs text-gray-500">({signal.timeframe})</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      signal.direction === 'LONG'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {signal.direction === 'LONG' ? (
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-4 w-4" />
                    )}
                    {signal.direction}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{signal.entryPrice.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  {signal.takeProfit.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 flex items-center">
                  <XCircle className="h-4 w-4 mr-1" />
                  {signal.stopLoss.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{signal.justification}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};