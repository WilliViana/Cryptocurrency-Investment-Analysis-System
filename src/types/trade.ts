/**
 * Ativos suportados para negociação.
 */
export type Asset = 'BTC' | 'ETH' | 'SOL'; // Exemplo inicial

/**
 * Timeframes para análise gráfica.
 */
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

/**
 * Direção do sinal de trade.
 */
export type SignalDirection = 'LONG' | 'SHORT';

/**
 * Nível de agressividade do trade, influencia o % de risco.
 */
export type AggressionLevel = 'Conservador' | 'Moderado' | 'Agressivo';

/**
 * Parâmetros de gestão de risco e dimensionamento de posição.
 */
export interface RiskParameters {
  leverage: number; // e.g., 10, 20, 50
  riskPercentage: number; // e.g., 0.5, 1, 2
  aggression: AggressionLevel;
}

/**
 * Estrutura completa de um sinal de trade gerado.
 */
export interface TradeSignal {
  id: string; // Identificador único do sinal
  asset: Asset;
  timeframe: Timeframe;
  direction: SignalDirection;
  entryPrice: number; // Preço de entrada sugerido
  stopLoss: number;
  takeProfit: number;
  conditions: string[]; // Lista de condições que geraram o sinal (e.g., "RSI < 30", "Cruzamento de Média Móvel")
  justification: string; // Justificativa técnica e/ou fundamental
  timestamp: number; // Quando o sinal foi gerado
}

/**
 * Estrutura de uma ordem formatada para a Hyperliquid (ou para exibição manual).
 */
export interface HyperliquidOrder {
  asset: Asset;
  is_buy: boolean;
  reduce_only: boolean;
  limit_px: string; // Preço formatado como string
  sz: string; // Tamanho da posição formatado como string
  order_type: { limit: { tif: 'Gtc' } }; // Exemplo de ordem limite
}

/**
 * Representa os dados OHLCV (Open, High, Low, Close, Volume) para uma vela.
 */
export interface OHLCV {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}