import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { fetchAllPrices, POOLS } from '../utils/api';

export default function PoolSelector({ selectedPools, onPoolToggle, prices, setPrices }) {
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const refreshPrices = async () => {
    setLoading(true);
    try {
      const newPrices = await fetchAllPrices();
      setPrices(newPrices);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error refreshing prices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!prices || Object.keys(prices).length === 0) {
      refreshPrices();
    }
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatTime = (date) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Select Liquidity Pools</CardTitle>
            <CardDescription>
              Choose which pools to allocate your treasury to
            </CardDescription>
          </div>
          <div className="text-right">
            <Button
              onClick={refreshPrices}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? 'Updating...' : 'Refresh Prices'}
            </Button>
            {lastUpdate && (
              <p className="text-xs text-muted-foreground mt-1">
                Last update: {formatTime(lastUpdate)}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.values(POOLS).map((pool) => {
            const isSelected = selectedPools.includes(pool.id);
            const priceData = prices?.[pool.id];

            return (
              <div
                key={pool.id}
                onClick={() => onPoolToggle(pool.id)}
                className={`
                  relative p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{pool.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pool.token0}/{pool.token1}
                    </p>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: pool.color }}
                  />
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Price</p>
                    <p className="font-mono font-semibold">
                      {priceData?.currentPrice
                        ? formatPrice(priceData.currentPrice)
                        : '---'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Base APR</p>
                    <p className="font-mono font-semibold text-green-600">
                      {(pool.baseAPR * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {selectedPools.length === 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Select at least one pool to start allocating your treasury
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
