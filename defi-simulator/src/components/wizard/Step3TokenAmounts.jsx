import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { calculatePositionFromAmount, getTokenAmounts, getLiquidityForAmount0, getLiquidityForAmount1, priceToSqrtPrice } from '../../utils/uniswapV3Math';
import { POOLS } from '../../utils/api';
import { AlertCircle, ArrowRightLeft, DollarSign } from 'lucide-react';

export default function Step3TokenAmounts({
  selectedPool,
  currentPrice,
  priceRange,
  tokenAmounts,
  onTokenAmountsChange,
}) {
  const pool = Object.values(POOLS).find(p => p.id === selectedPool);
  const [usdAmount, setUsdAmount] = useState('');
  const [calculatedAmounts, setCalculatedAmounts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (usdAmount && !isNaN(parseFloat(usdAmount))) {
      calculateAmounts();
    }
  }, [usdAmount, priceRange]);

  const calculateAmounts = () => {
    try {
      setError(null);
      const totalUSD = parseFloat(usdAmount);

      if (totalUSD <= 0) {
        setError('Amount must be greater than 0');
        return;
      }

      const isInRange = currentPrice >= priceRange.lower && currentPrice <= priceRange.upper;
      const isBelowRange = currentPrice < priceRange.lower;
      const isAboveRange = currentPrice > priceRange.upper;

      let amount0, amount1;

      if (isBelowRange) {
        // Below range: only token0 needed
        amount0 = totalUSD / currentPrice;
        amount1 = 0;
      } else if (isAboveRange) {
        // Above range: only token1 (USDC) needed
        amount0 = 0;
        amount1 = totalUSD;
      } else {
        // In range: need both tokens
        // Calculate optimal ratio based on liquidity formulas
        const sqrtPriceCurrent = priceToSqrtPrice(currentPrice);
        const sqrtPriceLower = priceToSqrtPrice(priceRange.lower);
        const sqrtPriceUpper = priceToSqrtPrice(priceRange.upper);

        // For a balanced position, we need to find how much of each token
        // Start with an arbitrary liquidity and calculate the ratio
        const L = 1000000; // Arbitrary liquidity value
        const testAmount0 = L * (sqrtPriceUpper - sqrtPriceCurrent) / (sqrtPriceUpper * sqrtPriceCurrent);
        const testAmount1 = L * (sqrtPriceCurrent - sqrtPriceLower);

        // Calculate USD values
        const testValue0 = testAmount0 * currentPrice;
        const testValue1 = testAmount1;
        const testTotalValue = testValue0 + testValue1;

        // Scale to match user's desired USD amount
        const scaleFactor = totalUSD / testTotalValue;
        amount0 = testAmount0 * scaleFactor;
        amount1 = testAmount1 * scaleFactor;
      }

      setCalculatedAmounts({
        amount0,
        amount1,
        inRange: isInRange,
      });

      onTokenAmountsChange({
        amount0,
        amount1,
      });
    } catch (err) {
      setError(err.message);
      setCalculatedAmounts(null);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(num);
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const isInRange = currentPrice >= priceRange.lower && currentPrice <= priceRange.upper;
  const isBelowRange = currentPrice < priceRange.lower;
  const isAboveRange = currentPrice > priceRange.upper;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Deposit Amount</h2>
        <p className="text-muted-foreground">
          Enter the total USD amount you want to deposit
        </p>
      </div>

      {/* Position Status */}
      <Card className={`${
        isInRange ? 'bg-green-50 dark:bg-green-950 border-green-500/50' :
        'bg-yellow-50 dark:bg-yellow-950 border-yellow-500/50'
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">
                {isInRange && 'Price In Range - Both tokens required'}
                {isBelowRange && `Price Below Range - Only ${pool.token0} required`}
                {isAboveRange && `Price Above Range - Only ${pool.token1} required`}
              </p>
              <p className="text-sm text-muted-foreground">
                Current price: {formatCurrency(currentPrice)} •
                Range: {formatCurrency(priceRange.lower)} - {formatCurrency(priceRange.upper)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* USD Amount Input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Total Deposit Amount (USD)
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="number"
            step="0.01"
            value={usdAmount}
            onChange={(e) => setUsdAmount(e.target.value)}
            placeholder="Enter USD amount (e.g., 1000)"
            className="text-lg pl-10 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          We'll automatically calculate the required token amounts for your position
        </p>
      </div>

      {/* Error */}
      {error && (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calculated Amounts */}
      {calculatedAmounts && !error && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">You Will Need</CardTitle>
            <CardDescription>
              Token breakdown for your ${formatNumber(parseFloat(usdAmount))} position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Token 0 */}
              {calculatedAmounts.amount0 > 0 && (
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{pool.token0}</p>
                    <p className="text-2xl font-bold font-mono text-primary">
                      {formatNumber(calculatedAmounts.amount0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">USD Value</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(calculatedAmounts.amount0 * currentPrice)}
                    </p>
                  </div>
                </div>
              )}

              {calculatedAmounts.amount0 > 0 && calculatedAmounts.amount1 > 0 && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <div className="h-px w-12 bg-border" />
                    <span>PLUS</span>
                    <div className="h-px w-12 bg-border" />
                  </div>
                </div>
              )}

              {/* Token 1 */}
              {calculatedAmounts.amount1 > 0 && (
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{pool.token1}</p>
                    <p className="text-2xl font-bold font-mono">
                      {formatNumber(calculatedAmounts.amount1)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">USD Value</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(calculatedAmounts.amount1)}
                    </p>
                  </div>
                </div>
              )}

              {/* Total Value */}
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Position Value</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(
                      calculatedAmounts.amount0 * currentPrice + calculatedAmounts.amount1
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>How it works:</strong> The token combination depends on where the current price is relative to your range:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              {isInRange && (
                <li>
                  <strong>In Range:</strong> You need both {pool.token0} and {pool.token1}. The ratio is automatically calculated based on the current price within your range.
                </li>
              )}
              {isBelowRange && (
                <li>
                  <strong>Below Range:</strong> You only need {pool.token0} since your range starts above the current price. Your position will convert to {pool.token1} as price rises into your range.
                </li>
              )}
              {isAboveRange && (
                <li>
                  <strong>Above Range:</strong> You only need {pool.token1} since your range ends below the current price. Your position will convert to {pool.token0} as price falls into your range.
                </li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
