import React from 'react';
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ErrorBar,
} from 'recharts';
import { OHLCV } from '../types/trade';

interface IndicatorData {
  smaShort?: (number | null)[];
  smaLong?: (number | null)[];
  bollingerBands?: {
    upper: (number | null)[];
    middle: (number | null)[];
    lower: (number | null)[];
  };
}

interface PriceChartProps {
  ohlcvData: OHLCV[];
  indicatorData: IndicatorData;
}

// Formata o timestamp para um formato legível
const formatXAxis = (tickItem: number) => {
  return new Date(tickItem).toLocaleDateString();
};

export const PriceChart: React.FC<PriceChartProps> = ({ ohlcvData, indicatorData }) => {
  // Combinar dados OHLCV com dados dos indicadores para o gráfico
  const chartData = ohlcvData.map((d, i) => ({
    timestamp: d.timestamp,
    // Para o gráfico de velas, precisamos de um array [open, close] para a barra
    price: [d.open, d.close],
    // Para os pavios (wicks), precisamos de um array [low, high]
    wick: [d.low, d.high],
    // Indicadores
    smaShort: indicatorData.smaShort?.[i] ?? null,
    smaLong: indicatorData.smaLong?.[i] ?? null,
    bbUpper: indicatorData.bollingerBands?.upper[i] ?? null,
    bbMiddle: indicatorData.bollingerBands?.middle[i] ?? null,
    bbLower: indicatorData.bollingerBands?.lower[i] ?? null,
  }));

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Gráfico de Preços e Indicadores</h2>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
          <YAxis domain={['auto', 'auto']} scale="log" allowDataOverflow={true} />
          <Tooltip
            formatter={(value: number[] | number, name: string) => {
              if (Array.isArray(value)) {
                return [`Abertura: ${value[0].toFixed(2)}, Fechamento: ${value[1].toFixed(2)}`, 'Preço'];
              }
              if (typeof value === 'number') {
                return [value.toFixed(2), name];
              }
              return [value, name];
            }}
          />
          <Legend />

          {/* Bandas de Bollinger (Área) */}
          <Area
            type="monotone"
            dataKey="bbUpper"
            fill="#8884d8"
            stroke="none"
            fillOpacity={0.1}
            name="BB Upper"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="bbLower"
            fill="#8884d8"
            stroke="none"
            fillOpacity={0.1}
            name="BB Lower"
            isAnimationActive={false}
          />

          {/* Gráfico de Velas (simulado com Bar e ErrorBar) */}
          <Bar dataKey="price" fill={(payload) => (payload.price[0] > payload.price[1] ? '#ef4444' : '#22c55e')}>
            <ErrorBar dataKey="wick" width={0} strokeWidth={1} />
          </Bar>

          {/* Médias Móveis (Linhas) */}
          <Line
            type="monotone"
            dataKey="smaShort"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
            name="SMA Curta"
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="smaLong"
            stroke="#82ca9d"
            strokeWidth={2}
            dot={false}
            name="SMA Longa"
            isAnimationActive={false}
          />
           <Line
            type="monotone"
            dataKey="bbMiddle"
            stroke="#ffc658"
            strokeDasharray="5 5"
            dot={false}
            name="BB Média"
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};