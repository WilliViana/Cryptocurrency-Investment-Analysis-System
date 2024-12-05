import { Language } from '../types/settings';

const translations = {
  'en': {
    'settings.language': 'Language',
    'settings.currency': 'Currency',
    'wallet.title': 'Your Wallet',
    'wallet.totalInvestment': 'Total Investment',
    'wallet.currentValue': 'Current Value',
    'wallet.profitLoss': 'Profit/Loss',
    'wallet.selectCrypto': 'Select Cryptocurrency',
    'wallet.investmentAmount': 'Investment amount',
    'wallet.addInvestment': 'Add Investment',
    'wallet.amount': 'Amount',
    'wallet.initialInvestment': 'Initial Investment',
    'wallet.currentValue': 'Current Value',
    'wallet.actions': 'Actions',
    'wallet.remove': 'Remove',
  },
  'pt-BR': {
    'settings.language': 'Idioma',
    'settings.currency': 'Moeda',
    'wallet.title': 'Sua Carteira',
    'wallet.totalInvestment': 'Investimento Total',
    'wallet.currentValue': 'Valor Atual',
    'wallet.profitLoss': 'Lucro/Prejuízo',
    'wallet.selectCrypto': 'Selecione a Criptomoeda',
    'wallet.investmentAmount': 'Valor do investimento',
    'wallet.addInvestment': 'Adicionar Investimento',
    'wallet.amount': 'Quantidade',
    'wallet.initialInvestment': 'Investimento Inicial',
    'wallet.currentValue': 'Valor Atual',
    'wallet.actions': 'Ações',
    'wallet.remove': 'Remover',
  },
} as const;

export const translate = (key: keyof typeof translations['en'], language: Language): string => {
  return translations[language][key] || key;
};