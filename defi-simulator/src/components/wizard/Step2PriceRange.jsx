import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { validatePriceRange } from '../../utils/uniswapV3Math';
import { calculateDynamicAPR } from '../../utils/api';
import { AlertCircle, TrendingUp } from 'lucide-react';

export default function Step2PriceRange({
  selectedPool,
  currentPrice,
  priceRange,
  onPriceRangeChange,
}) {
  const [priceLower, setPriceLower] = useState(priceRange.lower || '');
  const [priceUpper, setPriceUpper] = useState(priceRange.upper || '');
  const [validation, setValidation] = useState({ valid: true, error: null });

  useEffect(() => {
    if (currentPrice && !priceLower && !priceUpper) {
      // Set default range: ±20% from current price
      const lower = (currentPrice * 0.8).toFixed(2);
      const upper = (currentPrice * 1.2).toFixed(2);
      setPriceLower(lower);
      setPriceUpper(upper);
      onPriceRangeChange({ lower: parseFloat(lower), upper: parseFloat(upper) });
    }
  }, [currentPrice]);

  useEffect(() => {
    const lower = parseFloat(priceLower);
    const upper = parseFloat(priceUpper);

    if (!isNaN(lower) && !isNaN(upper)) {
      const validationResult = validatePriceRange(lower, upper, currentPrice);
      setValidation(validationResult);

      if (validationResult.valid) {
        onPriceRangeChange({ lower, upper });
      }
    }
  }, [priceLower, priceUpper, currentPrice]);

  const handlePreset = (percentage) => {
    const lower = (currentPrice * (1 - percentage / 100)).toFixed(2);
    const upper = (currentPrice * (1 + percentage / 100)).toFixed(2);
    setPriceLower(lower);
    setPriceUpper(upper);
  };

  // Generate price chart data
  const chartData = [];
  const lower = parseFloat(priceLower) || currentPrice * 0.8;
  const upper = parseFloat(priceUpper) || currentPrice * 1.2;

  // Ensure chart includes current price in the visible range
  const chartMin = Math.min(lower, currentPrice * 0.95);
  const chartMax = Math.max(upper, currentPrice * 1.05);
  const chartRange = chartMax - chartMin;
  const step = chartRange / 50;

  for (let i = 0; i <= 50; i++) {
    const price = chartMin + (step * i);
    const inRange = price >= lower && price <= upper;

    chartData.push({
      price: price.toFixed(2),
      liquidity: inRange ? 100 : 0,
      isCurrentPrice: Math.abs(price - currentPrice) < step / 2,
    });
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Set Price Range</h2>
        <p className="text-muted-foreground">
          Define your concentrated liquidity range for {selectedPool}
        </p>
      </div>

      {/* Current Price Info */}
      <Card className="bg-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Current Market Price</p>
            <p className="text-3xl font-bold font-mono text-primary">
              {formatPrice(currentPrice)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Presets */}
      <div>
        <p className="text-sm font-medium mb-3">Quick Range Presets</p>
        <div className="grid grid-cols-4 gap-2">
          {[5, 10, 20, 50].map((pct) => (
            <Button
              key={pct}
              variant="outline"
              size="sm"
              onClick={() => handlePreset(pct)}
            >
              ±{pct}%
            </Button>
          ))}
        </div>
      </div>

      {/* Price Range Inputs */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Min Price (Lower Bound)
          </label>
          <Input
            type="number"
            step="0.01"
            value={priceLower}
            onChange={(e) => setPriceLower(e.target.value)}
            placeholder="Enter min price"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Max Price (Upper Bound)
          </label>
          <Input
            type="number"
            step="0.01"
            value={priceUpper}
            onChange={(e) => setPriceUpper(e.target.value)}
            placeholder="Enter max price"
          />
        </div>
      </div>

      {/* Validation Error */}
      {!validation.valid && (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{validation.error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Range Visualization */}
      {validation.valid && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Liquidity Distribution</CardTitle>
            <CardDescription>
              Your liquidity will be active within the selected range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="liquidityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF007A" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#7B3FE4" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="price"
                  tickFormatter={(value) => `$${parseFloat(value).toFixed(0)}`}
                  tick={{ fontSize: 12 }}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(value, name) => [value > 0 ? 'Active' : 'Inactive', 'Liquidity']}
                  labelFormatter={(label) => `Price: ${formatPrice(parseFloat(label))}`}
                />
                <ReferenceLine
                  x={currentPrice.toFixed(2)}
                  stroke="#2172E5"
                  strokeWidth={2}
                  label={{
                    value: 'Current Price',
                    position: 'top',
                    fill: '#2172E5',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="step"
                  dataKey="liquidity"
                  stroke="#FF007A"
                  strokeWidth={2}
                  fill="url(#liquidityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Range Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/50">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Range Width</p>
                <p className="font-semibold">
                  {(((upper - lower) / currentPrice) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Lower Bound</p>
                <p className="font-semibold font-mono">{formatPrice(lower)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Upper Bound</p>
                <p className="font-semibold font-mono">{formatPrice(upper)}</p>
              </div>
            </div>

            {/* Estimated APR */}
            {validation.valid && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <TrendingUp className="w-5 h-5" />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Estimated APR</p>
                    <p className="text-2xl font-bold">
                      {(calculateDynamicAPR(selectedPool, currentPrice, lower, upper) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Narrower ranges earn higher fees but require more active management
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Visual Range Indicator */}
      {validation.valid && parseFloat(priceLower) > 0 && parseFloat(priceUpper) > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Range Position</p>
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            {/* Current price marker */}
            <div
              className="absolute w-0.5 h-full bg-foreground z-10"
              style={{ left: '50%' }}
            />
            {/* Selected range highlight */}
            <div
              className="absolute h-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 rounded-full transition-all"
              style={{
                left: `${Math.max(0, Math.min(100, ((lower / currentPrice - 0.5) * 100)))}%`,
                width: `${Math.min(100, ((upper - lower) / currentPrice) * 100)}%`
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>{formatPrice(lower)}</span>
            <span className="font-semibold text-foreground">
              Current: {formatPrice(currentPrice)}
            </span>
            <span>{formatPrice(upper)}</span>
          </div>
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Narrower ranges provide higher capital efficiency but require more active management.
            Your position will only earn fees when the price is within your selected range.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
