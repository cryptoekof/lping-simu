import { useState, useEffect } from 'react';
import LiquidityWizard from '../components/wizard/LiquidityWizard';
import { fetchAllPrices } from '../utils/api';
import { LoadingDots } from '../components/ui/loading';
import { useTranslation } from 'react-i18next';

export default function Simulator() {
  const [prices, setPrices] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  // Fetch prices on mount and every 30 seconds
  useEffect(() => {
    const updatePrices = async () => {
      try {
        const newPrices = await fetchAllPrices();
        setPrices(newPrices);
      } catch (error) {
        console.error('Failed to fetch prices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    updatePrices();
    const interval = setInterval(updatePrices, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient-terminal mb-2">
            {t('simulator.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('simulator.subtitle')}
          </p>
        </div>

        {isLoading && Object.keys(prices).length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <LoadingDots />
            <span className="text-muted-foreground text-sm">Fetching live prices...</span>
          </div>
        ) : (
          <LiquidityWizard prices={prices} />
        )}
      </div>
    </div>
  );
}
