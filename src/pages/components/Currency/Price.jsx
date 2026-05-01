// src/pages/components/Currency/Price.jsx
import React from 'react';
import { useCurrency } from './CurrencyContext';

/**
 * Global valyuta tizimi asosida narxni ko'rsatuvchi komponent.
 * @param {number} amount - Summa
 * @param {string} currency - Summaning asl valyutasi (default: USD)
 * @param {boolean} showSymbol - Valyuta belgisini ko'rsatish/ko'rsatmaslik
 * @param {string} className - Qo'shimcha CSS klasslar
 */
const Price = ({ amount, currency = 'USD', showSymbol = true, className = "" }) => {
  const { formatAmount } = useCurrency();

  return (
    <span className={`price-display ${className}`}>
      {formatAmount(amount, currency, showSymbol)}
    </span>
  );
};

export default Price;
