import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { POOLS } from '../../utils/api';
import { Check } from 'lucide-react';

export default function Step1PoolSelection({ selectedPool, onSelectPool, prices }) {
  const [lastPriceUpdate, setLastPriceUpdate] = useState(Date.now());

  useEffect(() => {
    if (prices && Object.keys(prices).length > 0) {
      setLastPriceUpdate(Date.now());
    }
  }, [prices]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const isPriceRecent = Date.now() - lastPriceUpdate < 3000;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select a Liquidity Pool</h2>
        <p className="text-muted-foreground">
          Choose which pool you want to provide liquidity to
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {Object.values(POOLS).map((pool) => {
          const isSelected = selectedPool === pool.id;
          const priceData = prices?.[pool.id];

          return (
            <Card
              key={pool.id}
              onClick={() => onSelectPool(pool.id)}
              tabIndex={0}
              role="button"
              aria-pressed={isSelected}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectPool(pool.id); } }}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'ring-2 shadow-lg'
                  : 'hover:shadow-md'
              }`}
              style={{
                borderColor: isSelected ? pool.color : undefined,
                boxShadow: isSelected ? `0 4px 20px ${pool.color}33` : undefined,
                '--tw-ring-color': pool.color,
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{pool.name}</CardTitle>
                    <CardDescription>{pool.token0}/{pool.token1}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: pool.color }}
                    />
                    {isSelected && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: pool.color }}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current Price</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold font-mono">
                        {priceData?.currentPrice
                          ? formatPrice(priceData.currentPrice)
                          : 'Loading...'}
                      </p>
                      {priceData?.currentPrice && isPriceRecent && (
                        <div
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ backgroundColor: '#22c55e' }}
                          title="Price just updated"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Base APR (10% range)</p>
                    <p className="text-lg font-semibold" style={{ color: pool.color }}>
                      {(pool.baseAPR * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      Concentrated liquidity with custom price ranges
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!selectedPool && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Select a pool above to continue
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
