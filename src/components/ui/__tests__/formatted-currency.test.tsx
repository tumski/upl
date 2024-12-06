import { render, screen } from '@/test/test-utils';
import { FormattedCurrency } from '../formatted-currency';

// Mock next-intl's useLocale hook
jest.mock('next-intl', () => ({
  useLocale: jest.fn(),
}));

describe('FormattedCurrency', () => {
  const useLocale = require('next-intl').useLocale;

  beforeEach(() => {
    useLocale.mockReset();
  });

  it('formats EUR correctly for German locale', () => {
    useLocale.mockReturnValue('de');
    render(<FormattedCurrency amount={99.99} />);
    expect(screen.getByTestId('formatted-currency')).toHaveTextContent('99,99 €');
  });

  it('formats PLN correctly for Polish locale with conversion', () => {
    useLocale.mockReturnValue('pl');
    render(<FormattedCurrency amount={100} />); // 100 EUR
    // 100 EUR * 4.32 = 432 PLN
    expect(screen.getByTestId('formatted-currency')).toHaveTextContent('432,00 zł');
  });

  it('formats DKK correctly for Danish locale with conversion', () => {
    useLocale.mockReturnValue('da');
    render(<FormattedCurrency amount={100} />); // 100 EUR
    // 100 EUR * 7.45 = 745 DKK
    expect(screen.getByTestId('formatted-currency')).toHaveTextContent('745,00 kr.');
  });

  it('uses EUR as fallback for unknown locale', () => {
    useLocale.mockReturnValue('unknown');
    render(<FormattedCurrency amount={99.99} />);
    expect(screen.getByTestId('formatted-currency')).toHaveTextContent('€99.99');
  });

  it('handles custom base currency conversion', () => {
    useLocale.mockReturnValue('de');
    // 100 PLN / 4.32 ≈ 23.15 EUR
    render(<FormattedCurrency amount={100} baseCurrency="PLN" />);
    expect(screen.getByTestId('formatted-currency')).toHaveTextContent('23,15 €');
  });

  it('applies custom className', () => {
    useLocale.mockReturnValue('en');
    render(<FormattedCurrency amount={99.99} className="text-lg font-bold" />);
    expect(screen.getByTestId('formatted-currency')).toHaveClass('text-lg', 'font-bold');
  });
});
