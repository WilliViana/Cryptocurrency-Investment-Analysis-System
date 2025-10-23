import { OHLCV } from '../types/trade';

/**
 * Calcula a Média Móvel Simples (SMA).
 * @param data - Array de dados de fechamento de preços.
 * @param period - O período da SMA (ex: 20).
 * @returns Um array com os valores da SMA.
 */
export const calculateSMA = (data: number[], period: number): (number | null)[] => {
  if (data.length < period) {
    return Array(data.length).fill(null);
  }

  const sma: (number | null)[] = Array(period - 1).fill(null);
  let sum = 0;

  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  sma.push(sum / period);

  for (let i = period; i < data.length; i++) {
    sum = sum - data[i - period] + data[i];
    sma.push(sum / period);
  }

  return sma;
};

/**
 * Calcula o Índice de Força Relativa (RSI).
 * @param data - Array de dados de fechamento de preços.
 * @param period - O período do RSI (ex: 14).
 * @returns Um array com os valores do RSI.
 */
export const calculateRSI = (data: number[], period: number = 14): (number | null)[] => {
  if (data.length <= period) {
    return Array(data.length).fill(null);
  }

  const rsi: (number | null)[] = Array(period).fill(null);
  let gains = 0;
  let losses = 0;

  // Calcula o primeiro ganho/perda médio
  for (let i = 1; i <= period; i++) {
    const change = data[i] - data[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses -= change; // losses são positivas
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  const firstRs = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
  rsi.push(firstRs);


  for (let i = period + 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    let currentGain = 0;
    let currentLoss = 0;

    if (change > 0) {
      currentGain = change;
    } else {
      currentLoss = -change;
    }

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }

  return rsi;
};

/**
 * Extrai os preços de fechamento dos dados OHLCV.
 * @param ohlcvData - Array de dados OHLCV.
 * @returns Um array com os preços de fechamento.
 */
export const getClosingPrices = (ohlcvData: OHLCV[]): number[] => {
  return ohlcvData.map(d => d.close);
};

/**
 * Calcula as Bandas de Bollinger.
 * @param data - Array de dados de fechamento de preços.
 * @param period - O período para a SMA (ex: 20).
 * @param stdDev - O número de desvios padrão (ex: 2).
 * @returns Um objeto com as bandas superior, média (SMA) e inferior.
 */
export const calculateBollingerBands = (data: number[], period: number = 20, stdDev: number = 2) => {
  const sma = calculateSMA(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = sma[i]!;
      const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
      const deviation = Math.sqrt(variance);
      upper.push(mean + stdDev * deviation);
      lower.push(mean - stdDev * deviation);
    }
  }
  return { upper, middle: sma, lower };
};

/**
 * Calcula o Preço Médio Ponderado por Volume (VWAP).
 * @param ohlcvData - Array de dados OHLCV.
 * @returns Um array com os valores do VWAP diário.
 */
export const calculateVWAP = (ohlcvData: OHLCV[]): (number | null)[] => {
  const vwap: (number | null)[] = [];
  let cumulativeTypicalPriceVolume = 0;
  let cumulativeVolume = 0;
  let lastDay = -1;

  ohlcvData.forEach(d => {
    const day = new Date(d.timestamp).getUTCDate();
    if (day !== lastDay) {
      // Reseta no início de um novo dia
      cumulativeTypicalPriceVolume = 0;
      cumulativeVolume = 0;
      lastDay = day;
    }

    const typicalPrice = (d.high + d.low + d.close) / 3;
    cumulativeTypicalPriceVolume += typicalPrice * d.volume;
    cumulativeVolume += d.volume;

    vwap.push(cumulativeVolume > 0 ? cumulativeTypicalPriceVolume / cumulativeVolume : null);
  });

  return vwap;
};

/**
 * Calcula a Convergência/Divergência de Médias Móveis (MACD).
 * @param data - Array de dados de fechamento de preços.
 * @param shortPeriod - Período da EMA curta (ex: 12).
 * @param longPeriod - Período da EMA longa (ex: 26).
 * @param signalPeriod - Período da EMA do sinal (ex: 9).
 * @returns Um objeto com as linhas MACD, de sinal e o histograma.
 */
export const calculateMACD = (data: number[], shortPeriod = 12, longPeriod = 26, signalPeriod = 9) => {
  const calculateEMA = (prices: number[], period: number) => {
    const k = 2 / (period + 1);
    const ema: (number | null)[] = Array(prices.length).fill(null);
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += prices[i];
    }
    ema[period - 1] = sum / period;

    for (let i = period; i < prices.length; i++) {
      ema[i] = (prices[i] * k) + (ema[i - 1]! * (1 - k));
    }
    return ema;
  };

  const emaShort = calculateEMA(data, shortPeriod);
  const emaLong = calculateEMA(data, longPeriod);

  const macdLine: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (emaShort[i] !== null && emaLong[i] !== null) {
      macdLine.push(emaShort[i]! - emaLong[i]!);
    } else {
      macdLine.push(null);
    }
  }

  const signalLine = calculateEMA(macdLine.filter(v => v !== null) as number[], signalPeriod);

  // Alinhar a signal line com a macdLine
  const alignedSignalLine: (number | null)[] = Array(data.length).fill(null);
  let signalIndex = 0;
  for(let i = 0; i < data.length; i++) {
    if (macdLine[i] !== null) {
      if(signalLine[signalIndex] !== undefined) {
        alignedSignalLine[i] = signalLine[signalIndex];
        signalIndex++;
      }
    }
  }

  const histogram: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (macdLine[i] !== null && alignedSignalLine[i] !== null) {
      histogram.push(macdLine[i]! - alignedSignalLine[i]!);
    } else {
      histogram.push(null);
    }
  }

  return { macdLine, signalLine: alignedSignalLine, histogram };
};