import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'english' | 'hindi' | 'telugu';

// Extended interface for Monument to match the final DB schema
export interface Monument {
  id: string;
  name: string;
  description: string; // Fallback English description
  historical_info: string | null; // Fallback English historical info
  location: string;
  category: string | null;
  image_url: string | null;
  model_url: string | null;

  description_english: string | null;
  description_hindi: string | null;
  description_telugu: string | null;
  historical_info_english: string | null;
  historical_info_hindi: string | null;
  historical_info_telugu: string | null;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  getMonumentText: (
    monument: Monument, 
    field: 'description' | 'historical_info'
  ) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'english';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };
  
  // CORE HELPER FUNCTION: Retrieves the correct language column based on context state
  const getMonumentText = (
    monument: Monument, 
    field: 'description' | 'historical_info'
  ): string => {
    // Construct the dynamic column name, e.g., 'description_hindi'
    const dynamicKey = `${field}_${language}` as keyof Monument;
    
    // 1. Try to return the specific translated field
    const translatedText = monument[dynamicKey];
    if (translatedText) {
        return translatedText as string;
    }
    
    // 2. Fallback to the default (English) version
    const defaultKey = (field === 'description' ? 'description_english' : 'historical_info_english') as keyof Monument;
    const defaultText = monument[defaultKey];

    if (defaultText) {
        return defaultText as string;
    }

    // 3. Fallback to the basic English field if no explicit *_english column is found
    return (monument[field as keyof Monument] as string) || 'Content not available.';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, getMonumentText }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
