import { CryptoData } from '../types/crypto';

export const MOCK_CRYPTO_DATA: CryptoData[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    current_price: 65000,
    market_cap: 1270000000000,
    price_change_percentage_24h: 2.5,
    total_volume: 28000000000
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    current_price: 3500,
    market_cap: 420000000000,
    price_change_percentage_24h: 3.2,
    total_volume: 15000000000
  },
  {
    id: 'binancecoin',
    symbol: 'bnb',
    name: 'BNB',
    current_price: 450,
    market_cap: 75000000000,
    price_change_percentage_24h: -1.2,
    total_volume: 2000000000
  }
];