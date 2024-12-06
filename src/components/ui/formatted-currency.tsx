'use client';

import { useLocale } from 'next-intl';

const currencyByLocale: Record<string, string> = {
  en: 'EUR', // Using EUR as default for all locales as per EU market focus
  de: 'EUR',
  nl: 'EUR',
  da: 'DKK',
  pl: 'PLN',
};

const exchangeRates: Record<string, number> = {
  EUR: 1,
  DKK: 7.45, // Example rate
  PLN: 4.32, // Example rate
};

interface FormattedCurrencyProps {
  amount: number;
  className?: string;
  /**
   * Base currency of the amount (defaults to EUR)
   */
  baseCurrency?: keyof typeof exchangeRates;
}

export function FormattedCurrency({
  amount,
  className,
  baseCurrency = 'EUR',
}: FormattedCurrencyProps) {
  const locale = useLocale();
  const targetCurrency = currencyByLocale[locale] || 'EUR';

  // Convert amount if necessary
  const convertedAmount =
    targetCurrency === baseCurrency
      ? amount
      : amount * (exchangeRates[targetCurrency] / exchangeRates[baseCurrency]);

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: targetCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <span className={className} data-testid="formatted-currency">
      {formatter.format(convertedAmount)}
    </span>
  );
}
