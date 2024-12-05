export type Language = 'en' | 'pt-BR';
export type Currency = 'USD' | 'BRL';

export interface Settings {
  language: Language;
  currency: Currency;
}

export interface CurrencyFormat {
  symbol: string;
  locale: string;
}