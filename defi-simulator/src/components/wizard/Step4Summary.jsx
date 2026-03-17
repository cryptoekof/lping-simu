import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { getPositionStatus } from '../../utils/uniswapV3Math';
import { POOLS, calculateDynamicAPR } from '../../utils/api';
import { Check, X, TrendingUp, TrendingDown, Minus, Percent } from 'lucide-react';

export default function Step4Summary({
  selectedPool,
  currentPrice,
  priceRange,
  tokenAmounts,
}) {
  const pool = Object.values(POOLS).find(p => p.id === selectedPool);

  const positionStatus = getPositionStatus(
    currentPrice,
    priceRange.lower,
    priceRange.upper,
    tokenAmounts.amount0,
    tokenAmounts.amount1
  );

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

  const StatusIcon = () => {
    if (positionStatus.status === 'in_range') {
      return <Check className="w-8 h-8 text-green-500" />;
    } else if (positionStatus.status === 'below_range') {
      return <TrendingDown className="w-8 h-8 text-yellow-500" />;
    } else {
      return <TrendingUp className="w-8 h-8 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Position Summary</h2>
        <p className="text-muted-foreground">
          Review your liquidity position details
        </p>
      </div>

      {/* Status Card */}
      <Card className={`${
        positionStatus.inRange
          ? 'bg-green-50 dark:bg-green-950 border-green-500'
          : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-500'
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <StatusIcon />
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">
                {positionStatus.inRange ? 'Position In Range' : 'Position Out of Range'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {positionStatus.status === 'in_range' && 'Your position is actively earning fees'}
                {positionStatus.status === 'below_range' && 'Price is below your range - position is 100% ' + pool.token0}
                {positionStatus.status === 'above_range' && 'Price is above your range - position is 100% ' + pool.token1}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pool Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pool Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pool</span>
              <span className="font-semibold">{pool.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Price</span>
              <span className="font-semibold font-mono">{formatCurrency(currentPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price Range</span>
              <span className="font-semibold font-mono">
                {formatCurrency(priceRange.lower)} - {formatCurrency(priceRange.upper)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Range Width</span>
              <span className="font-semibold">
                {(((priceRange.upper - priceRange.lower) / currentPrice) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border/50">
              <span className="text-muted-foreground flex items-center gap-2">
                <Percent className="w-4 h-4" />
                Estimated APR
              </span>
              <span className="text-xl font-bold text-green-600">
                {(calculateDynamicAPR(selectedPool, currentPrice, priceRange.lower, priceRange.upper) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Composition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Token Composition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Token 0 */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">{pool.token0}</span>
                <span className="text-sm font-semibold">
                  {positionStatus.proportion0.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${positionStatus.proportion0}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatNumber(tokenAmounts.amount0)} {pool.token0}
                </span>
                <span className="text-xs font-semibold">
                  {formatCurrency(positionStatus.value0)}
                </span>
              </div>
            </div>

            {/* Token 1 */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">{pool.token1}</span>
                <span className="text-sm font-semibold">
                  {positionStatus.proportion1.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-secondary"
                  style={{ width: `${positionStatus.proportion1}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatNumber(tokenAmounts.amount1)} {pool.token1}
                </span>
                <span className="text-xs font-semibold">
                  {formatCurrency(positionStatus.value1)}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-border/50">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Position Value</span>
                <span className="text-2xl font-bold">
                  {formatCurrency(positionStatus.totalValue)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Active Liquidity:</strong> Your position will only earn fees when the price is within your selected range ({formatCurrency(priceRange.lower)} - {formatCurrency(priceRange.upper)}).
            </p>
            <p>
              <strong>Token Ratio:</strong> As the price moves within your range, the ratio of tokens will automatically adjust. When price approaches the upper bound, your position will be mostly {pool.token1}. When price approaches the lower bound, it will be mostly {pool.token0}.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
