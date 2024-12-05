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