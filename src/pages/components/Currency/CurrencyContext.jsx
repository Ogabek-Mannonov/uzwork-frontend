// src/pages/components/Currency/CurrencyContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSystemRates } from '../../../api/common';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  // LocalStorage'dan olingan yoki default USD
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('userCurrency') || 'USD';
  });

  const [rates, setRates] = useState({ USD: 1, UZS: 12100, RUB: 90 });
  const [loading, setLoading] = useState(true);

  // Valyutani o'zgartirish va saqlash
  const setCurrency = (newCurrency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('userCurrency', newCurrency);
  };

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await getSystemRates();
        if (res?.success && res.data) {
          const fetchedRates = res.data.rates;
          let uzsRate = 12600;
          let rubRate = 92;

          if (Array.isArray(fetchedRates)) {
            const usdToUzs = fetchedRates.find(r => r.to_currency === 'UZS' || r.to_currency === 'uzs');
            const usdToRub = fetchedRates.find(r => r.to_currency === 'RUB' || r.to_currency === 'rub');
            if (usdToUzs) uzsRate = Number(usdToUzs.rate);
            if (usdToRub) rubRate = Number(usdToRub.rate);
          } else if (fetchedRates.USD) {
            uzsRate = fetchedRates.USD.UZS || 12600;
            rubRate = fetchedRates.USD.RUB || 92;
          }

          setRates({ USD: 1, UZS: uzsRate, RUB: rubRate });
        }
      } catch (err) {
        console.error("Currency rates fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    // Har 1 soatda yangilab turish mumkin
    const interval = setInterval(fetchRates, 3600000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Har qanday summani tanlangan global valyutaga o'girib beradi
   * @param {number} amount - summa
   * @param {string} from - summaning asl valyutasi (default: USD)
   */
  const convert = (amount, from = 'USD') => {
    if (!amount) return 0;
    const val = Number(amount);
    
    // 1. Avval USD ga o'giramiz (agar USD bo'lmasa)
    let usdValue = val;
    if (from === 'UZS') usdValue = val / rates.UZS;
    if (from === 'RUB') usdValue = val / rates.RUB;

    // 2. Keyin maqsadli valyutaga o'giramiz
    if (currency === 'UZS') return usdValue * rates.UZS;
    if (currency === 'RUB') return usdValue * rates.RUB;
    return usdValue;
  };

  /**
   * Summani formatlab beradi
   */
  const formatAmount = (amount, from = 'USD', showSymbol = true) => {
    const converted = convert(amount, from);
    
    const formatter = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: currency === 'UZS' ? 0 : 2,
      maximumFractionDigits: currency === 'UZS' ? 0 : 2,
    });

    const formatted = formatter.format(converted);

    if (!showSymbol) return formatted;

    if (currency === 'USD') return `$${formatted}`;
    if (currency === 'UZS') return `${formatted} UZS`;
    if (currency === 'RUB') return `${formatted} ₽`;
    
    return formatted;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, formatAmount, convert, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
