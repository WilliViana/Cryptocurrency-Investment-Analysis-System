import React, { useState, useEffect } from 'react';
import { getFearAndGreedIndex, FearAndGreedValue } from '../services/api';
import { HelpCircle } from 'lucide-react';

export const SentimentIndicator: React.FC = () => {
  const [sentiment, setSentiment] = useState<FearAndGreedValue | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSentiment = async () => {
      setIsLoading(true);
      const data = await getFearAndGreedIndex();
      if (data && data.data.length > 0) {
        setSentiment(data.data[0]);
      }
      setIsLoading(false);
    };

    fetchSentiment();
  }, []);

  const getSentimentColor = (classification: string): string => {
    switch (classification) {
      case 'Extreme Fear':
        return 'text-red-600';
      case 'Fear':
        return 'text-orange-500';
      case 'Neutral':
        return 'text-gray-500';
      case 'Greed':
        return 'text-yellow-500';
      case 'Extreme Greed':
        return 'text-green-600';
      default:
        return 'text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-4 text-center">
        <p className="text-sm text-gray-500">Carregando Sentimento de Mercado...</p>
      </div>
    );
  }

  if (!sentiment) {
    return null; // Não renderiza nada se não conseguir buscar os dados
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">Sentimento de Mercado</h3>
        <div className="group relative">
          <HelpCircle className="h-5 w-5 text-gray-400 cursor-pointer" />
          <div className="absolute bottom-full mb-2 w-64 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Índice "Fear & Greed". Valores baixos indicam medo (potencial de compra), valores altos indicam ganância (potencial de venda).
          </div>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className={`text-3xl font-bold ${getSentimentColor(sentiment.value_classification)}`}>
          {sentiment.value}
        </p>
        <p className={`text-md font-semibold ${getSentimentColor(sentiment.value_classification)}`}>
          {sentiment.value_classification}
        </p>
      </div>
    </div>
  );
};