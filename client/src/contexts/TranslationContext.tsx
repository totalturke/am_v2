import React, { createContext, useContext } from 'react';
import { t } from '@/lib/translations';

type TranslationContextType = {
  t: (key: string) => string;
};

const TranslationContext = createContext<TranslationContextType>({
  t: (key: string) => key,
});

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <TranslationContext.Provider value={{ t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);
