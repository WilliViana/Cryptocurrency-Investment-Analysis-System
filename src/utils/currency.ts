import { Currency, CurrencyFormat } from '../types/settings';

export const CURRENCY_FORMATS: Record<Currency, CurrencyFormat> = {
  USD: {
    symbol: '$',
    locale: 'en-US',
  },
  BRL: {
    symbol: 'R$',
    locale: 'pt-BR',
  },
};

export const formatCurrency = (amount: number, currency: Currency): string => {
  const format = CURRENCY_FORMATS[currency];
  return new Intl.NumberFormat(format.locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};