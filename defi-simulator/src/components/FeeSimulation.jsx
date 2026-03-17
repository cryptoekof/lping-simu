import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { POOLS, calculateFees, calculateImpermanentLoss, calculateTotalValue } from '../utils/api';
import { getDaysElapsed } from '../utils/storage';

export default function FeeSimulation({
  allocations,
  prices,
  initialPrices,
  simulationActive,
  onReset,
}) {
  const [daysElapsed, setDaysElapsed] = useState(0);
  const [simulationData, setSimulationData] = useState({});

  useEffect(() => {
    if (simulationActive) {
      const days = getDaysElapsed();
      setDaysElapsed(days);

      // Calculate simulation data for each pool
      const data = {};
      Object.entries(allocations).forEach(([poolId, allocation]) => {
        if (allocation > 0) {
          const pool = Object.values(POOLS).find((p) => p.id === poolId);
          const currentPrice = prices[poolId]?.currentPrice || 0;
          const initPrice = initialPrices[poolId] || currentPrice;
          const priceRatio = initPrice > 0 ? currentPrice / initPrice : 1;

          const fees = calculateFees(allocation, pool.baseAPR, days);
          const il = calculateImpermanentLoss(priceRatio);
          const totalValue = calculateTotalValue(allocation, fees, il);

          data[poolId] = {
            pool,
            allocation,
            fees,
            il: il * 100, // Convert to percentage
            priceRatio,
            initialPrice: initPrice,
            currentPrice,
            ...totalValue,
          };
        }
      });

      setSimulationData(data);
    }
  }, [simulationActive, allocations, prices, initialPrices, daysElapsed]);

  // Update days elapsed every hour
  useEffect(() => {
    if (!simulationActive) return;

    const interval = setInterval(() => {
      setDaysElapsed(getDaysElapsed());
    }, 60 * 60 * 1000); // Update every hour

    return () => clearInterval(interval);
  }, [simulationActive]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const totalStats = Object.values(simulationData).reduce(
    (acc, data) => ({
      initialValue: acc.initialValue + data.initialValue,
      fees: acc.fees + data.fees,
      impermanentLoss: acc.impermanentLoss + data.impermanentLoss,
      finalValue: acc.finalValue + data.finalValue,
      netReturn: acc.netReturn + data.netReturn,
    }),
    { initialValue: 0, fees: 0, impermanentLoss: 0, finalValue: 0, netReturn: 0 }
  );

  const totalReturnPercentage =
    totalStats.initialValue > 0
      ? (totalStats.netReturn / totalStats.initialValue) * 100
      : 0;

  if (!simulationActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fee Simulation</CardTitle>
          <CardDescription>
            Start a simulation to see projected returns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-12 text-center bg-muted rounded-lg">
            <p className="text-muted-foreground mb-2">
              No active simulation
            </p>
            <p className="text-sm text-muted-foreground">
              Allocate your treasury to pools and click "Start Simulation" to begin
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Simulation Results</CardTitle>
              <CardDescription>
                Days elapsed: {daysElapsed} | Linear fee generation model
              </CardDescription>
            </div>
            <Button onClick={onReset} variant="outline" size="sm">
              Reset Simulation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Initial Value</p>
              <p className="text-lg font-semibold">
                {formatCurrency(totalStats.initialValue)}
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Fees Earned</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(totalStats.fees)}
              </p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Impermanent Loss</p>
              <p className="text-lg font-semibold text-red-600">
                -{formatCurrency(totalStats.impermanentLoss)}
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Final Value</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(totalStats.finalValue)}
              </p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Net Return</p>
              <p className={`text-lg font-semibold ${totalReturnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(totalReturnPercentage)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Pool Details */}
      {Object.entries(simulationData).map(([poolId, data]) => (
        <Card key={poolId}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: data.pool.color }}
              />
              <CardTitle className="text-lg">{data.pool.name}</CardTitle>
            </div>
            <CardDescription>
              APR: {(data.pool.baseAPR * 100).toFixed(1)}% | Allocation: {formatCurrency(data.allocation)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Price Information */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Initial Price</p>
                  <p className="font-mono text-sm font-semibold">
                    {formatCurrency(data.initialPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Price</p>
                  <p className="font-mono text-sm font-semibold">
                    {formatCurrency(data.currentPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Price Change</p>
                  <p className={`font-mono text-sm font-semibold ${data.priceRatio >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage((data.priceRatio - 1) * 100)}
                  </p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Fees</p>
                  <p className="text-sm font-semibold text-green-600">
                    {formatCurrency(data.fees)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">IL</p>
                  <p className="text-sm font-semibold text-red-600">
                    -{formatCurrency(data.impermanentLoss)} ({data.il.toFixed(2)}%)
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Final Value</p>
                  <p className="text-sm font-semibold">
                    {formatCurrency(data.finalValue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Net Return</p>
                  <p className={`text-sm font-semibold ${data.netReturnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(data.netReturn)} ({formatPercentage(data.netReturnPercentage)})
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
