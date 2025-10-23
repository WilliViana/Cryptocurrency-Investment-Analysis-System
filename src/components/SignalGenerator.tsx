import React, { useState } from 'react';
import { TradeSignal, Asset, Timeframe, AggressionLevel, OHLCV } from '../types/trade';
import { generateSignal } from '../services/signalGenerator';
import { SignalDashboard } from './SignalDashboard';
import { PriceChart } from './PriceChart';
import { Button } from './ui/Button';
import { SentimentIndicator } from './SentimentIndicator';

// Tipos para os dados de análise
interface AnalysisData {
  ohlcv: OHLCV[];
  indicators: {
    smaShort?: (number | null)[];
    smaLong?: (number | null)[];
    bollingerBands?: {
      upper: (number | null)[];
      middle: (number | null)[];
      lower: (number | null)[];
    };
  };
}

export const SignalGenerator: React.FC = () => {
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  const [selectedAsset, setSelectedAsset] = useState<Asset>('BTC');
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1h');
  const [selectedAggression, setSelectedAggression] = useState<AggressionLevel>('Moderado');
  const [leverage, setLeverage] = useState<number>(20);

  const handleGenerateSignal = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisData(null);

    try {
      const result = await generateSignal(selectedAsset, selectedTimeframe);

      if (result && result.analysisData) {
        setAnalysisData(result.analysisData);
        if (result.signal) {
          setSignals(prevSignals => [result.signal, ...prevSignals]);
        } else {
          setError(`Nenhum sinal claro encontrado para ${selectedAsset} no timeframe ${selectedTimeframe}.`);
        }
      } else {
         setError('Não foi possível obter dados para a análise.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao gerar o sinal.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna de Controles */}
        <div className="lg:col-span-2 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Gerador de Sinais</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label htmlFor="asset-select" className="block text-sm font-medium text-gray-700">Ativo</label>
              <select id="asset-select" value={selectedAsset} onChange={(e) => setSelectedAsset(e.target.value as Asset)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option>BTC</option> <option>ETH</option> <option>SOL</option>
              </select>
            </div>
            <div>
              <label htmlFor="timeframe-select" className="block text-sm font-medium text-gray-700">Timeframe</label>
              <select id="timeframe-select" value={selectedTimeframe} onChange={(e) => setSelectedTimeframe(e.target.value as Timeframe)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="1h">1 Hora</option> <option value="4h">4 Horas</option> <option value="1d">Diário</option>
              </select>
            </div>
            <div>
              <label htmlFor="aggression-select" className="block text-sm font-medium text-gray-700">Agressividade</label>
              <select id="aggression-select" value={selectedAggression} onChange={(e) => setSelectedAggression(e.target.value as AggressionLevel)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option>Conservador</option> <option>Moderado</option> <option>Agressivo</option>
              </select>
            </div>
            <div>
              <label htmlFor="leverage-input" className="block text-sm font-medium text-gray-700">Alavancagem (x)</label>
              <input type="number" id="leverage-input" value={leverage} onChange={(e) => setLeverage(Math.max(1, Math.min(100, Number(e.target.value))))} className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" min="1" max="100" />
            </div>
            <Button onClick={handleGenerateSignal} disabled={isLoading} className="w-full">
              {isLoading ? 'Analisando...' : 'Gerar Sinal'}
            </Button>
          </div>
        </div>

        {/* Coluna de Sentimento */}
        <div className="lg:col-span-1">
          <SentimentIndicator />
        </div>
      </div>

      {analysisData && (
        <PriceChart ohlcvData={analysisData.ohlcv} indicatorData={analysisData.indicators} />
      )}

      <SignalDashboard signals={signals} />
    </div>
  );
};