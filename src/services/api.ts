import axios, { AxiosError } from 'axios';
import { CryptoData } from '../types/crypto';
import { Currency } from '../types/settings';
import { MOCK_CRYPTO_DATA } from '../utils/mockData';

const API_BASE_URL = 'https://api.coingecko.com/api/v3';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add retry delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Convert mock data based on currency
const convertMockData = (data: CryptoData[], currency: Currency): CryptoData[] => {
  const rate = currency === 'BRL' ? 5 : 1; // Approximate BRL/USD rate
  return data.map(crypto => ({
    ...crypto,
    current_price: crypto.current_price * rate,
    market_cap: crypto.market_cap * rate,
    total_volume: crypto.total_volume * rate
  }));
};

export const getCryptoData = async (currency: Currency = 'USD'): Promise<CryptoData[]> => {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await api.get<CryptoData[]>('/coins/markets', {
        params: {
          vs_currency: currency.toLowerCase(),
          order: 'market_cap_desc',
          per_page: 10,
          sparkline: false,
          precision: 2,
          x_cg_demo_api_key: 'CG-Lm6mxnrYzxVxQhbwqZMKE8U2' // Pass API key as query parameter
        }
      });

      return response.data.map(crypto => ({
        id: crypto.id,
        symbol: crypto.symbol,
        name: crypto.name,
        current_price: Number(crypto.current_price),
        market_cap: Number(crypto.market_cap),
        price_change_percentage_24h: Number(crypto.price_change_percentage_24h),
        total_volume: Number(crypto.total_volume)
      }));
    } catch (error) {
      if (error instanceof AxiosError) {
        // Handle rate limiting
        if (error.response?.status === 429) {
          retries++;
          if (retries < maxRetries) {
            await delay(1000 * Math.pow(2, retries)); // Exponential backoff
            continue;
          }
        }
        
        console.error('API Error:', {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });

        // If we've exhausted retries or hit other errors, fall back to mock data
        console.log('Falling back to mock data due to API error');
        return convertMockData(MOCK_CRYPTO_DATA, currency);
      }
      
      console.error('Unexpected error:', error);
      return convertMockData(MOCK_CRYPTO_DATA, currency);
    }
  }
  
  // If we've exhausted retries, fall back to mock data
  console.log('Falling back to mock data after max retries');
  return convertMockData(MOCK_CRYPTO_DATA, currency);
};

import { OHLCV } from '../types/trade';

/**
 * Busca dados históricos OHLCV para uma criptomoeda específica.
 * @param coinId - O ID da moeda na CoinGecko (ex: 'bitcoin').
 * @param currency - A moeda para a cotação (ex: 'usd').
 * @param days - O número de dias de dados a buscar.
 * @returns Uma promessa que resolve para um array de dados OHLCV.
 */
export const getCryptoOHLCV = async (
  coinId: string,
  currency: string,
  days: number = 90
): Promise<OHLCV[]> => {
  try {
    // 1. Fazer as duas chamadas à API em paralelo para eficiência
    const [ohlcResponse, marketChartResponse] = await Promise.all([
      api.get<[number, number, number, number, number][]>(`/coins/${coinId}/ohlc`, {
        params: {
          vs_currency: currency.toLowerCase(),
          days: days,
          x_cg_demo_api_key: 'CG-Lm6mxnrYzxVxQhbwqZMKE8U2',
        },
      }),
      api.get<{ total_volumes: [number, number][] }>(`/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: currency.toLowerCase(),
          days: days,
          interval: 'daily',
          x_cg_demo_api_key: 'CG-Lm6mxnrYzxVxQhbwqZMKE8U2',
        },
      }),
    ]);

    const ohlcData = ohlcResponse.data;
    const volumeData = marketChartResponse.data.total_volumes;

    // 2. Criar um mapa de volumes para busca rápida
    const volumeMap = new Map<number, number>();
    volumeData.forEach(([timestamp, volume]) => {
      // O timestamp do market_chart pode ser ligeiramente diferente, então normalizamos para o início do dia
      const date = new Date(timestamp);
      date.setUTCHours(0, 0, 0, 0);
      volumeMap.set(date.getTime(), volume);
    });

    // 3. Mesclar os dados OHLC com os dados de volume
    return ohlcData.map(([timestamp, open, high, low, close]) => {
      const date = new Date(timestamp);
      date.setUTCHours(0, 0, 0, 0);
      const volume = volumeMap.get(date.getTime()) || 0; // Usa 0 se não encontrar correspondência

      return {
        timestamp,
        open,
        high,
        low,
        close,
        volume,
      };
    });

  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('API Error (getCryptoOHLCV):', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    } else {
      console.error('Unexpected error (getCryptoOHLCV):', error);
    }
    // Retorna um array vazio em caso de erro para não quebrar a aplicação.
    return [];
  }
};

export interface FearAndGreedValue {
  value: string;
  value_classification: string;
  timestamp: string;
  time_until_update?: string;
}

export interface FearAndGreedIndex {
  name: string;
  data: FearAndGreedValue[];
}

/**
 * Busca o índice "Fear & Greed" da API alternative.me.
 * @returns Uma promessa que resolve para os dados do índice.
 */
export const getFearAndGreedIndex = async (): Promise<FearAndGreedIndex | null> => {
  try {
    // Usando axios para consistência, mas para uma API externa sem chave, poderia ser fetch.
    const response = await axios.get('https://api.alternative.me/fng/?limit=1');
    return response.data;
  } catch (error) {
    console.error('API call error (getFearAndGreedIndex):', error);
    return null;
  }
};