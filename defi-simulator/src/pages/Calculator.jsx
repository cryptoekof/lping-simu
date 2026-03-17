import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeftRight, TrendingDown, Coins, Droplet } from 'lucide-react';
import {
  calculateSwapOutput,
  calculatePriceImpact,
  FEE_TIERS,
  calculateLPShares,
  calculateInitialShares,
  calculateTVL
} from '../utils/ammCalculations';
import {
  calculateILFromPriceRatio,
  calculateILScenarios,
  suggestOptimalRange
} from '../utils/impermanentLoss';
import {
  projectStakingRewards,
  calculateStakingAPR
} from '../utils/stakingRewards';
import { calculatePoolHealth } from '../utils/poolMetrics';

export default function Calculator() {
  const [calculatorMode, setCalculatorMode] = useState('swap'); // swap, il, staking, lp

  const calculatorModes = [
    { id: 'swap', label: 'Swap Calculator', icon: ArrowLeftRight },
    { id: 'il', label: 'Impermanent Loss', icon: TrendingDown },
    { id: 'staking', label: 'Staking Rewards', icon: Coins },
    { id: 'lp', label: 'LP Calculator', icon: Droplet }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient-terminal mb-2">
            DeFi Calculators
          </h1>
          <p className="text-muted-foreground">
            Advanced calculators powered by real DeFi protocols
          </p>
        </div>

        {/* Calculator Mode Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {calculatorModes.map(mode => {
            const Icon = mode.icon;
            return (
              <Button
                key={mode.id}
                onClick={() => setCalculatorMode(mode.id)}
                variant={calculatorMode === mode.id ? 'default' : 'outline'}
                className={`whitespace-nowrap ${calculatorMode === mode.id ? 'btn-terminal-primary' : ''}`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {mode.label}
              </Button>
            );
          })}
        </div>

        {/* Calculator Content */}
        {calculatorMode === 'swap' && <SwapCalculator />}
        {calculatorMode === 'il' && <ILCalculator />}
        {calculatorMode === 'staking' && <StakingCalculator />}
        {calculatorMode === 'lp' && <LPCalculator />}
      </div>
    </div>
  );
}

// Swap Calculator Component
function SwapCalculator() {
  const [amountIn, setAmountIn] = useState('1000');
  const [reserve0, setReserve0] = useState('100000');
  const [reserve1, setReserve1] = useState('200000000');
  const [feeTier, setFeeTier] = useState('MEDIUM');
  const [result, setResult] = useState(null);

  const calculate = () => {
    try {
      const result = calculateSwapOutput(
        parseFloat(amountIn),
        parseFloat(reserve0),
        parseFloat(reserve1),
        FEE_TIERS[feeTier].rate
      );
      setResult(result);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="card-gradient border-accent/20">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Swap Calculator</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Calculate swap output, price impact, and fees using the constant product formula
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Amount In (Token 0)
              </label>
              <Input
                type="number"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                placeholder="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Reserve Token 0
              </label>
              <Input
                type="number"
                value={reserve0}
                onChange={(e) => setReserve0(e.target.value)}
                placeholder="100000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Reserve Token 1
              </label>
              <Input
                type="number"
                value={reserve1}
                onChange={(e) => setReserve1(e.target.value)}
                placeholder="200000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Fee Tier
              </label>
              <select
                className="w-full p-2 rounded-md border bg-background"
                value={feeTier}
                onChange={(e) => setFeeTier(e.target.value)}
              >
                {Object.entries(FEE_TIERS).map(([key, tier]) => (
                  <option key={key} value={key}>
                    {tier.name} - {tier.description}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={calculate} className="w-full button-gradient">
              Calculate Swap
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-gradient border-accent/20">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4">Results</h3>
          {result ? (
            <div className="space-y-4">
              <ResultRow label="Amount Out" value={result.amountOut.toFixed(6)} unit="Token 1" />
              <ResultRow label="Effective Price" value={result.effectivePrice.toFixed(6)} />
              <ResultRow label="Spot Price" value={result.spotPrice.toFixed(6)} />
              <ResultRow
                label="Price Impact"
                value={`${result.priceImpact.toFixed(4)}%`}
                highlight={result.priceImpact > 1}
              />
              <ResultRow label="Fee Amount" value={result.feeAmount.toFixed(6)} unit="Token 0" />

              <div className="mt-6 p-4 rounded-lg bg-accent/10">
                <h4 className="font-semibold mb-2">💡 Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  {result.priceImpact > 5
                    ? '⚠️ High price impact! Consider splitting into smaller trades.'
                    : result.priceImpact > 1
                    ? '⚠️ Moderate price impact. This trade will move the market.'
                    : '✅ Low price impact. Good liquidity for this trade size.'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Enter values and click Calculate to see results
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// IL Calculator Component
function ILCalculator() {
  const [initialPrice, setInitialPrice] = useState('2000');
  const [currentPrice, setCurrentPrice] = useState('2500');
  const [scenarios, setScenarios] = useState(null);

  const calculate = () => {
    const price = parseFloat(initialPrice);
    const multipliers = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
    const results = calculateILScenarios(price, multipliers);
    setScenarios(results);
  };

  const priceRatio = parseFloat(currentPrice) / parseFloat(initialPrice);
  const currentIL = calculateILFromPriceRatio(priceRatio) * 100;

  return (
    <div className="space-y-6">
      <Card className="card-gradient border-accent/20">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Impermanent Loss Calculator</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Understand how price changes affect your LP position
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Initial Price
              </label>
              <Input
                type="number"
                value={initialPrice}
                onChange={(e) => setInitialPrice(e.target.value)}
                placeholder="2000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Current Price
              </label>
              <Input
                type="number"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                placeholder="2500"
              />
            </div>

            <div className="flex items-end">
              <Button onClick={calculate} className="w-full button-gradient">
                Calculate Scenarios
              </Button>
            </div>
          </div>

          {/* Current IL Display */}
          <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Current Impermanent Loss</p>
              <p className="text-4xl font-bold text-gradient-uni">{currentIL.toFixed(2)}%</p>
              <p className="text-sm text-muted-foreground mt-2">
                Price change: {((priceRatio - 1) * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IL Scenarios Table */}
      {scenarios && (
        <Card className="card-gradient border-accent/20">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">IL Scenarios</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-accent/20">
                    <th className="text-left p-3">Price Multiplier</th>
                    <th className="text-right p-3">New Price</th>
                    <th className="text-right p-3">Price Change</th>
                    <th className="text-right p-3">IL %</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((scenario, index) => (
                    <tr key={index} className="border-b border-accent/10 hover:bg-accent/5">
                      <td className="p-3">{scenario.multiplier}x</td>
                      <td className="text-right p-3">${scenario.newPrice.toFixed(2)}</td>
                      <td className="text-right p-3">
                        <span className={scenario.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {scenario.priceChange >= 0 ? '+' : ''}
                          {scenario.priceChange.toFixed(2)}%
                        </span>
                      </td>
                      <td className="text-right p-3">
                        <span className="text-red-400 font-semibold">
                          {scenario.ilPercent.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Staking Calculator Component
function StakingCalculator() {
  const [stakeAmount, setStakeAmount] = useState('10000');
  const [apr, setAPR] = useState('25');
  const [days, setDays] = useState('365');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const projection = projectStakingRewards(
      parseFloat(stakeAmount),
      parseFloat(apr) / 100,
      parseFloat(days)
    );
    setResult(projection);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="card-gradient border-accent/20">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Staking Rewards Calculator</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Project your staking rewards over time
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Stake Amount ($)
              </label>
              <Input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="10000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                APR (%)
              </label>
              <Input
                type="number"
                value={apr}
                onChange={(e) => setAPR(e.target.value)}
                placeholder="25"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Staking Period (days)
              </label>
              <Input
                type="number"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="365"
              />
            </div>

            <Button onClick={calculate} className="w-full button-gradient">
              Calculate Rewards
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-gradient border-accent/20">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4">Projected Rewards</h3>
          {result ? (
            <div className="space-y-4">
              <ResultRow label="Staked Amount" value={`$${result.stakedAmount.toLocaleString()}`} />
              <ResultRow
                label="Rewards Earned"
                value={`$${result.rewardsEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                highlight
              />
              <ResultRow
                label="Total Value"
                value={`$${result.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
              <ResultRow
                label="Percent Gain"
                value={`${result.percentGain.toFixed(2)}%`}
              />
              <ResultRow
                label="Daily Rewards"
                value={`$${result.dailyRewards.toFixed(2)}`}
              />

              <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <h4 className="font-semibold mb-2">📊 Summary</h4>
                <p className="text-sm text-muted-foreground">
                  By staking ${parseFloat(stakeAmount).toLocaleString()} for {days} days at {apr}% APR,
                  you'll earn approximately ${result.rewardsEarned.toLocaleString()} in rewards.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Enter values and click Calculate to see projections
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// LP Calculator Component
function LPCalculator() {
  const [amount0, setAmount0] = useState('1');
  const [amount1, setAmount1] = useState('2000');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const shares = calculateInitialShares(parseFloat(amount0), parseFloat(amount1));
    setResult({
      amount0: parseFloat(amount0),
      amount1: parseFloat(amount1),
      lpShares: shares,
      valueToken0: parseFloat(amount0),
      valueToken1: parseFloat(amount1),
      totalValue: parseFloat(amount0) * (parseFloat(amount1) / parseFloat(amount0)) + parseFloat(amount1)
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="card-gradient border-accent/20">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">LP Share Calculator</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Calculate LP shares from token amounts using geometric mean formula
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Token 0 Amount (e.g., ETH)
              </label>
              <Input
                type="number"
                value={amount0}
                onChange={(e) => setAmount0(e.target.value)}
                placeholder="1"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Token 1 Amount (e.g., USDC)
              </label>
              <Input
                type="number"
                value={amount1}
                onChange={(e) => setAmount1(e.target.value)}
                placeholder="2000"
              />
            </div>

            <Button onClick={calculate} className="w-full button-gradient">
              Calculate LP Shares
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-gradient border-accent/20">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4">Your LP Position</h3>
          {result ? (
            <div className="space-y-4">
              <ResultRow label="Token 0 Deposited" value={result.amount0.toFixed(6)} />
              <ResultRow label="Token 1 Deposited" value={result.amount1.toFixed(2)} />
              <ResultRow
                label="LP Shares"
                value={result.lpShares.toFixed(6)}
                highlight
              />
              <ResultRow
                label="Implied Price"
                value={`${(result.amount1 / result.amount0).toFixed(2)}`}
                unit="Token1/Token0"
              />

              <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-semibold mb-2">💧 LP Shares Formula</h4>
                <p className="text-sm text-muted-foreground">
                  LP Shares = √(amount0 × amount1)
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This geometric mean formula ensures balanced liquidity provision.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Enter token amounts to calculate LP shares
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for displaying results
function ResultRow({ label, value, unit, highlight }) {
  return (
    <div className="flex justify-between items-center p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-accent' : ''}`}>
        {value} {unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
      </span>
    </div>
  );
}
