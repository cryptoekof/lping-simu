import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Slider } from '../components/ui/slider';
import {
  simulateArbitrage,
  simulateLiquidation,
  simulateCollateralSwap,
  getStepEducation,
  FLASH_LOAN_FEE
} from '../utils/flashLoan';
import { PlayCircle, RefreshCw, Info, AlertCircle, CheckCircle, XCircle, Zap } from 'lucide-react';

export default function FlashLoan() {
  const [scenario, setScenario] = useState('arbitrage');
  const [simulation, setSimulation] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Arbitrage parameters
  const [arbLoanAmount, setArbLoanAmount] = useState(100000);
  const [arbBuyPrice, setArbBuyPrice] = useState(2000);
  const [arbSellPrice, setArbSellPrice] = useState(2050);

  // Liquidation parameters
  const [liqLoanAmount, setLiqLoanAmount] = useState(50000);
  const [liqDebt, setLiqDebt] = useState(40000);
  const [liqCollateral, setLiqCollateral] = useState(52000);
  const [liqBonus, setLiqBonus] = useState(5);

  // Collateral swap parameters
  const [swapLoanAmount, setSwapLoanAmount] = useState(80000);
  const [swapDebt, setSwapDebt] = useState(60000);
  const [swapOldCollateral, setSwapOldCollateral] = useState(75000);
  const [swapNewCollateral, setSwapNewCollateral] = useState(78000);

  const runSimulation = () => {
    let result;

    switch (scenario) {
      case 'arbitrage':
        result = simulateArbitrage(arbLoanAmount, arbBuyPrice, arbSellPrice);
        break;
      case 'liquidation':
        result = simulateLiquidation(liqLoanAmount, liqDebt, liqCollateral, liqBonus / 100);
        break;
      case 'collateral':
        result = simulateCollateralSwap(swapLoanAmount, swapDebt, swapOldCollateral, swapNewCollateral);
        break;
      default:
        return;
    }

    setSimulation(result);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const playSteps = () => {
    if (!simulation) return;

    setIsPlaying(true);
    setCurrentStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= simulation.steps.length) {
        clearInterval(interval);
        setIsPlaying(false);
      } else {
        setCurrentStep(step);
      }
    }, 1500); // 1.5 seconds per step
  };

  const reset = () => {
    setSimulation(null);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient-terminal mb-2 flex items-center gap-3">
            <Zap className="w-10 h-10 text-secondary" />
            Flash Loan Simulator
          </h1>
          <p className="text-muted-foreground">
            Learn how flash loans work through interactive step-by-step simulations
          </p>
        </div>

        {/* Educational Banner */}
        <Card className="mb-6 border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">What are Flash Loans?</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Flash loans are <strong>uncollateralized loans</strong> that must be borrowed and repaid
                  within the <strong>same transaction</strong>. If you cannot repay, the entire transaction
                  reverts - like it never happened!
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Use cases:</strong> Arbitrage, Liquidations, Collateral Swaps •
                  <strong> Fee:</strong> {(FLASH_LOAN_FEE * 100).toFixed(2)}% •
                  <strong> Risk:</strong> Only gas fees if transaction fails
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scenario Selector */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <ScenarioCard
            id="arbitrage"
            title="💱 Arbitrage"
            description="Buy low on DEX A, sell high on DEX B"
            active={scenario === 'arbitrage'}
            onClick={() => { setScenario('arbitrage'); reset(); }}
            difficulty="Beginner"
            profitPotential="Low-Medium"
          />
          <ScenarioCard
            id="liquidation"
            title="🔨 Liquidation"
            description="Liquidate undercollateralized positions"
            active={scenario === 'liquidation'}
            onClick={() => { setScenario('liquidation'); reset(); }}
            difficulty="Intermediate"
            profitPotential="Medium-High"
          />
          <ScenarioCard
            id="collateral"
            title="🔄 Collateral Swap"
            description="Swap collateral without closing position"
            active={scenario === 'collateral'}
            onClick={() => { setScenario('collateral'); reset(); }}
            difficulty="Advanced"
            profitPotential="Utility"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Parameters */}
          <Card className="card-gradient border-accent/20">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Configure Parameters</h2>

              {scenario === 'arbitrage' && (
                <ArbitrageParameters
                  loanAmount={arbLoanAmount}
                  setLoanAmount={setArbLoanAmount}
                  buyPrice={arbBuyPrice}
                  setBuyPrice={setArbBuyPrice}
                  sellPrice={arbSellPrice}
                  setSellPrice={setArbSellPrice}
                />
              )}

              {scenario === 'liquidation' && (
                <LiquidationParameters
                  loanAmount={liqLoanAmount}
                  setLoanAmount={setLiqLoanAmount}
                  debt={liqDebt}
                  setDebt={setLiqDebt}
                  collateral={liqCollateral}
                  setCollateral={setLiqCollateral}
                  bonus={liqBonus}
                  setBonus={setLiqBonus}
                />
              )}

              {scenario === 'collateral' && (
                <CollateralSwapParameters
                  loanAmount={swapLoanAmount}
                  setLoanAmount={setSwapLoanAmount}
                  debt={swapDebt}
                  setDebt={setSwapDebt}
                  oldCollateral={swapOldCollateral}
                  setOldCollateral={setSwapOldCollateral}
                  newCollateral={swapNewCollateral}
                  setNewCollateral={setSwapNewCollateral}
                />
              )}

              <div className="flex gap-2 mt-6">
                <Button
                  onClick={runSimulation}
                  className="flex-1 button-gradient"
                  disabled={isPlaying}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Run Simulation
                </Button>
                {simulation && (
                  <>
                    <Button
                      onClick={playSteps}
                      variant="outline"
                      disabled={isPlaying}
                    >
                      Step-by-Step
                    </Button>
                    <Button
                      onClick={reset}
                      variant="outline"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Visualization */}
          <Card className="card-gradient border-accent/20">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Step-by-Step Visualization</h2>

              {!simulation ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Configure parameters and run simulation</p>
                </div>
              ) : (
                <StepVisualizer
                  steps={simulation.steps}
                  currentStep={currentStep}
                  isPlaying={isPlaying}
                  simulation={simulation}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {simulation && (
          <Card className="mt-6 card-gradient border-accent/20">
            <CardContent className="p-6">
              <ResultsSummary simulation={simulation} scenario={scenario} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Scenario Card Component
function ScenarioCard({ id, title, description, active, onClick, difficulty, profitPotential }) {
  return (
    <Card
      className={`cursor-pointer transition-all ${
        active
          ? 'border-accent bg-accent/10 shadow-lg'
          : 'border-accent/20 hover:border-accent/40 hover:bg-accent/5'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {difficulty}
          </span>
          <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">
            {profitPotential}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Arbitrage Parameters
function ArbitrageParameters({ loanAmount, setLoanAmount, buyPrice, setBuyPrice, sellPrice, setSellPrice }) {
  const priceDiff = sellPrice - buyPrice;
  const priceDiffPercent = ((priceDiff / buyPrice) * 100).toFixed(2);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Flash Loan Amount ($)
        </label>
        <Input
          type="number"
          value={loanAmount}
          onChange={(e) => setLoanAmount(parseFloat(e.target.value))}
          step="1000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Buy Price on DEX A ($)
        </label>
        <Input
          type="number"
          value={buyPrice}
          onChange={(e) => setBuyPrice(parseFloat(e.target.value))}
          step="10"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Sell Price on DEX B ($)
        </label>
        <Input
          type="number"
          value={sellPrice}
          onChange={(e) => setSellPrice(parseFloat(e.target.value))}
          step="10"
        />
      </div>

      <div className="p-3 rounded-lg bg-muted/30 text-sm">
        <div className="flex justify-between">
          <span>Price Difference:</span>
          <span className={priceDiff > 0 ? 'text-green-400' : 'text-red-400'}>
            ${priceDiff.toFixed(2)} ({priceDiffPercent}%)
          </span>
        </div>
      </div>
    </div>
  );
}

// Liquidation Parameters
function LiquidationParameters({ loanAmount, setLoanAmount, debt, setDebt, collateral, setCollateral, bonus, setBonus }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Flash Loan Amount ($)
        </label>
        <Input
          type="number"
          value={loanAmount}
          onChange={(e) => setLoanAmount(parseFloat(e.target.value))}
          step="1000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Borrower's Debt ($)
        </label>
        <Input
          type="number"
          value={debt}
          onChange={(e) => setDebt(parseFloat(e.target.value))}
          step="1000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Collateral Value ($)
        </label>
        <Input
          type="number"
          value={collateral}
          onChange={(e) => setCollateral(parseFloat(e.target.value))}
          step="1000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Liquidation Bonus: {bonus}%
        </label>
        <Slider
          value={[bonus]}
          onValueChange={(value) => setBonus(value[0])}
          min={0}
          max={15}
          step={0.5}
          className="mt-2"
        />
      </div>
    </div>
  );
}

// Collateral Swap Parameters
function CollateralSwapParameters({ loanAmount, setLoanAmount, debt, setDebt, oldCollateral, setOldCollateral, newCollateral, setNewCollateral }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Flash Loan Amount ($)
        </label>
        <Input
          type="number"
          value={loanAmount}
          onChange={(e) => setLoanAmount(parseFloat(e.target.value))}
          step="1000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Existing Debt ($)
        </label>
        <Input
          type="number"
          value={debt}
          onChange={(e) => setDebt(parseFloat(e.target.value))}
          step="1000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Old Collateral Value ($)
        </label>
        <Input
          type="number"
          value={oldCollateral}
          onChange={(e) => setOldCollateral(parseFloat(e.target.value))}
          step="1000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          New Collateral Value ($)
        </label>
        <Input
          type="number"
          value={newCollateral}
          onChange={(e) => setNewCollateral(parseFloat(e.target.value))}
          step="1000"
        />
      </div>
    </div>
  );
}

// Step Visualizer
function StepVisualizer({ steps, currentStep, isPlaying, simulation }) {
  const displaySteps = steps.slice(0, isPlaying ? currentStep + 1 : steps.length);
  const activeStep = steps[currentStep];
  const education = getStepEducation(activeStep?.step.id);

  return (
    <div className="space-y-4">
      {/* Steps Timeline */}
      <div className="space-y-3">
        {displaySteps.map((step, index) => (
          <StepCard
            key={index}
            step={step}
            isActive={index === currentStep}
            isComplete={index < currentStep}
            index={index}
          />
        ))}
      </div>

      {/* Educational Content */}
      {education && education.title && (
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4">
            <h4 className="font-bold mb-2">{education.title}</h4>
            <p className="text-sm text-muted-foreground mb-2">{education.explanation}</p>
            <p className="text-sm text-accent">💡 {education.keyPoint}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Step Card
function StepCard({ step, isActive, isComplete, index }) {
  const getStepIcon = () => {
    if (step.step.id === 'complete') return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (step.step.id === 'failed') return <XCircle className="w-5 h-5 text-red-400" />;
    return <span className="text-2xl">{step.step.icon}</span>;
  };

  const getStepColor = () => {
    if (step.step.id === 'complete') return 'border-green-500/30 bg-green-500/10';
    if (step.step.id === 'failed') return 'border-red-500/30 bg-red-500/10';
    if (isActive) return 'border-accent bg-accent/10 shadow-lg';
    return 'border-accent/20 bg-accent/5';
  };

  return (
    <Card className={`transition-all ${getStepColor()}`}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            {getStepIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-sm">
                Step {index + 1}: {step.step.name}
              </h4>
              {step.balance !== undefined && (
                <span className="text-sm font-mono text-accent whitespace-nowrap">
                  ${step.balance.toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{step.action}</p>
            {step.profit && (
              <p className="text-sm text-green-400 mt-1 font-semibold">
                💰 Profit: ${step.profit.toFixed(2)}
              </p>
            )}
            {step.shortfall && (
              <p className="text-sm text-red-400 mt-1 font-semibold">
                ⚠️ Shortfall: ${step.shortfall.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Results Summary
function ResultsSummary({ simulation, scenario }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Simulation Results</h2>

      <div className={`p-6 rounded-lg mb-6 ${
        simulation.success
          ? 'bg-green-500/10 border border-green-500/20'
          : 'bg-red-500/10 border border-red-500/20'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          {simulation.success ? (
            <>
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <h3 className="text-xl font-bold text-green-400">Transaction Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  Flash loan repaid, profit secured
                </p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-8 h-8 text-red-400" />
              <div>
                <h3 className="text-xl font-bold text-red-400">Transaction Failed!</h3>
                <p className="text-sm text-muted-foreground">
                  Insufficient funds - entire transaction reverted
                </p>
              </div>
            </>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Loan Amount</p>
            <p className="text-lg font-bold">${simulation.loanAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Flash Loan Fee</p>
            <p className="text-lg font-bold">${simulation.fee.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Net Profit/Loss</p>
            <p className={`text-lg font-bold ${simulation.success ? 'text-green-400' : 'text-red-400'}`}>
              {simulation.success ? '+' : ''}${simulation.netProfit.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Scenario-specific details */}
      {scenario === 'arbitrage' && simulation.success && (
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-muted/20">
            <p className="text-muted-foreground mb-1">Tokens Received</p>
            <p className="font-semibold">{simulation.tokensReceived.toFixed(2)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20">
            <p className="text-muted-foreground mb-1">Profit Percentage</p>
            <p className="font-semibold">{simulation.profitPercent.toFixed(3)}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
