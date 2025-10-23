import { getCryptoOHLCV } from './api';
import {
  calculateSMA,
  getClosingPrices,
  calculateRSI,
  calculateBollingerBands,
  calculateMACD
} from '../utils/indicators';
import { TradeSignal, Asset, Timeframe, SignalDirection } from '../types/trade';
import { v4 as uuidv4 } from 'uuid';

// Parâmetros da Estratégia
const SHORT_SMA_PERIOD = 10;
const LONG_SMA_PERIOD = 30;
const RSI_PERIOD = 14;
const RSI_OVERBOUGHT = 70;
const RSI_OVERSOLD = 30;
const BB_PERIOD = 20;
const BB_STD_DEV = 2;
const MACD_SHORT = 12;
const MACD_LONG = 26;
const MACD_SIGNAL = 9;

/**
 * Gera um sinal de trade com base em uma confluência de indicadores.
 * @param asset - O ativo a ser analisado.
 * @param timeframe - O timeframe para a análise.
 * @param riskParams - Os parâmetros de risco definidos pelo usuário.
 * @returns Uma promessa que resolve para um TradeSignal ou null.
 */
interface AnalysisData {
  ohlcv: import('../types/trade').OHLCV[];
  indicators: {
    smaShort: (number | null)[];
    smaLong: (number | null)[];
    bollingerBands: { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] };
  };
}

interface SignalResult {
  signal: TradeSignal | null;
  analysisData: AnalysisData;
}

export const generateSignal = async (
  asset: Asset,
  timeframe: Timeframe
): Promise<SignalResult | null> => {
  const coinIdMap: { [key in Asset]: string } = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    SOL: 'solana',
  };
  const coinId = coinIdMap[asset];

  const days = timeframe === '1d' ? 200 : 90;
  const ohlcvData = await getCryptoOHLCV(coinId, 'usd', days);

  if (ohlcvData.length < Math.max(LONG_SMA_PERIOD, BB_PERIOD, MACD_LONG)) {
    console.warn(`Dados insuficientes para ${asset} no timeframe ${timeframe}`);
    return null;
  }

  const closingPrices = getClosingPrices(ohlcvData);
  const lastIndex = closingPrices.length - 1;
  const prevIndex = lastIndex - 1;

  // --- Calcular todos os indicadores ---
  const shortSma = calculateSMA(closingPrices, SHORT_SMA_PERIOD);
  const longSma = calculateSMA(closingPrices, LONG_SMA_PERIOD);
  const rsi = calculateRSI(closingPrices, RSI_PERIOD);
  const bollingerBands = calculateBollingerBands(closingPrices, BB_PERIOD, BB_STD_DEV);
  const macd = calculateMACD(closingPrices, MACD_SHORT, MACD_LONG, MACD_SIGNAL);

  // --- Verificar se os dados mais recentes dos indicadores são válidos ---
  if (
    !shortSma[lastIndex] || !longSma[lastIndex] || !shortSma[prevIndex] || !longSma[prevIndex] ||
    !rsi[lastIndex] || !bollingerBands.upper[lastIndex] || !bollingerBands.lower[lastIndex] ||
    !macd.macdLine[lastIndex] || !macd.signalLine[lastIndex]
  ) {
    return null;
  }

  const lastShortSma = shortSma[lastIndex]!;
  const lastLongSma = longSma[lastIndex]!;
  const prevShortSma = shortSma[prevIndex]!;
  const prevLongSma = longSma[prevIndex]!;
  const lastRsi = rsi[lastIndex]!;
  const lastPrice = closingPrices[lastIndex];
  const lastBBUpper = bollingerBands.upper[lastIndex]!;
  const lastBBLower = bollingerBands.lower[lastIndex]!;
  const lastMACDLine = macd.macdLine[lastIndex]!;
  const lastMACDSignal = macd.signalLine[lastIndex]!;

  let direction: SignalDirection | null = null;
  const conditions: string[] = [];

  // --- Lógica de Sinal Aprimorada ---

  // Condição de Compra (LONG)
  const isSmaCrossUp = prevShortSma <= prevLongSma && lastShortSma > lastLongSma;
  const isRsiOkForLong = lastRsi < RSI_OVERBOUGHT;
  const isMacdOkForLong = lastMACDLine > lastMACDSignal; // Linha MACD acima da linha de sinal
  const isPriceNearBB = lastPrice < lastBBUpper; // Evitar comprar no topo da volatilidade

  if (isSmaCrossUp && isRsiOkForLong && isMacdOkForLong && isPriceNearBB) {
    direction = 'LONG';
    conditions.push(`Cruzamento de alta SMA(${SHORT_SMA_PERIOD}/${LONG_SMA_PERIOD})`);
    conditions.push(`RSI em ${lastRsi.toFixed(2)} (Não sobrecomprado)`);
    conditions.push(`MACD positivo (confirmação de momento)`);
    conditions.push(`Preço abaixo da Banda de Bollinger Superior`);
  }

  // Condição de Venda (SHORT)
  const isSmaCrossDown = prevShortSma >= prevLongSma && lastShortSma < lastLongSma;
  const isRsiOkForShort = lastRsi > RSI_OVERSOLD;
  const isMacdOkForShort = lastMACDLine < lastMACDSignal; // Linha MACD abaixo da linha de sinal
  const isPriceNearBBLower = lastPrice > lastBBLower; // Evitar vender no fundo da volatilidade

  if (isSmaCrossDown && isRsiOkForShort && isMacdOkForShort && isPriceNearBBLower) {
    direction = 'SHORT';
    conditions.push(`Cruzamento de baixa SMA(${SHORT_SMA_PERIOD}/${LONG_SMA_PERIOD})`);
    conditions.push(`RSI em ${lastRsi.toFixed(2)} (Não sobrevendido)`);
    conditions.push(`MACD negativo (confirmação de momento)`);
    conditions.push(`Preço acima da Banda de Bollinger Inferior`);
  }

  const analysisData: AnalysisData = {
    ohlcv: ohlcvData,
    indicators: {
      smaShort: shortSma,
      smaLong: longSma,
      bollingerBands: bollingerBands,
    },
  };

  if (direction) {
    const entryPrice = lastPrice;
    const stopLoss = direction === 'LONG' ? lastBBLower : lastBBUpper;
    const riskAmount = Math.abs(entryPrice - stopLoss);
    const takeProfit = direction === 'LONG' ? entryPrice + riskAmount * 1.5 : entryPrice - riskAmount * 1.5;

    const signal: TradeSignal = {
      id: uuidv4(),
      asset,
      timeframe,
      direction,
      entryPrice,
      stopLoss,
      takeProfit,
      conditions,
      justification: `Sinal gerado por confluência de SMA, RSI, Bandas de Bollinger e MACD.`,
      timestamp: Date.now(),
    };
    return { signal, analysisData };
  }

  // Retorna os dados da análise mesmo sem sinal
  return { signal: null, analysisData };
};