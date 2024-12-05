export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  total_volume: number;
}

export interface ChartData {
  timestamp: string;
  price: number;
}

export interface WalletHolding {
  cryptoId: string;
  amount: number;
  initialInvestment: number;
}

export interface WalletState {
  holdings: WalletHolding[];
  totalInvestment: number;
}