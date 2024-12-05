import React, { createContext, useContext, useReducer } from 'react';
import { WalletState, WalletHolding } from '../types/crypto';

type WalletAction =
  | { type: 'ADD_HOLDING'; payload: WalletHolding }
  | { type: 'UPDATE_HOLDING'; payload: WalletHolding }
  | { type: 'REMOVE_HOLDING'; payload: string };

const initialState: WalletState = {
  holdings: [],
  totalInvestment: 0,
};

const walletReducer = (state: WalletState, action: WalletAction): WalletState => {
  switch (action.type) {
    case 'ADD_HOLDING':
      return {
        ...state,
        holdings: [...state.holdings, action.payload],
        totalInvestment: state.totalInvestment + action.payload.initialInvestment,
      };
    case 'UPDATE_HOLDING':
      return {
        ...state,
        holdings: state.holdings.map((holding) =>
          holding.cryptoId === action.payload.cryptoId ? action.payload : holding
        ),
      };
    case 'REMOVE_HOLDING':
      const holdingToRemove = state.holdings.find(h => h.cryptoId === action.payload);
      return {
        ...state,
        holdings: state.holdings.filter((holding) => holding.cryptoId !== action.payload),
        totalInvestment: state.totalInvestment - (holdingToRemove?.initialInvestment || 0),
      };
    default:
      return state;
  }
};

const WalletContext = createContext<{
  state: WalletState;
  dispatch: React.Dispatch<WalletAction>;
} | null>(null);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  return (
    <WalletContext.Provider value={{ state, dispatch }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};