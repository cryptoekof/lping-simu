import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Step1PoolSelection from './Step1PoolSelection';
import Step2PriceRange from './Step2PriceRange';
import Step3TokenAmounts from './Step3TokenAmounts';
import Step4Summary from './Step4Summary';
import { POOLS } from '../../utils/api';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

export default function LiquidityWizard({ prices }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    selectedPool: null,
    currentPrice: null,
    priceRange: { lower: 0, upper: 0 },
    tokenAmounts: { amount0: 0, amount1: 0 },
  });

  // Update current price when pool is selected
  useEffect(() => {
    if (wizardData.selectedPool && prices?.[wizardData.selectedPool]) {
      setWizardData(prev => ({
        ...prev,
        currentPrice: prices[wizardData.selectedPool].currentPrice
      }));
    }
  }, [wizardData.selectedPool, prices]);

  const handlePoolSelect = (poolId) => {
    setWizardData(prev => ({ ...prev, selectedPool: poolId }));
  };

  const handlePriceRangeChange = (range) => {
    setWizardData(prev => ({ ...prev, priceRange: range }));
  };

  const handleTokenAmountsChange = (amounts) => {
    setWizardData(prev => ({ ...prev, tokenAmounts: amounts }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return wizardData.selectedPool !== null;
      case 2:
        return wizardData.priceRange.lower > 0 && wizardData.priceRange.upper > 0;
      case 3:
        return wizardData.tokenAmounts.amount0 > 0 || wizardData.tokenAmounts.amount1 > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    // Save position to localStorage
    const newPosition = {
      id: Date.now().toString(),
      poolId: wizardData.selectedPool,
      initialPrice: wizardData.currentPrice,
      priceRange: wizardData.priceRange,
      tokenAmounts: wizardData.tokenAmounts,
      createdAt: new Date().toISOString(),
    };

    // Get existing positions
    const existingPositions = JSON.parse(localStorage.getItem('positions') || '[]');

    // Add new position
    const updatedPositions = [...existingPositions, newPosition];

    // Save to localStorage
    localStorage.setItem('positions', JSON.stringify(updatedPositions));

    // Show success toast
    const pool = Object.values(POOLS).find(p => p.id === wizardData.selectedPool);
    toast.success('Position Created!', {
      description: `${wizardData.tokenAmounts.amount0.toFixed(4)} ${pool?.token0 || ''} + ${wizardData.tokenAmounts.amount1.toFixed(2)} ${pool?.token1 || ''}`,
      duration: 4000,
    });

    // Navigate to positions page
    navigate('/positions');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1PoolSelection
            selectedPool={wizardData.selectedPool}
            onSelectPool={handlePoolSelect}
            prices={prices}
          />
        );
      case 2:
        return (
          <Step2PriceRange
            selectedPool={wizardData.selectedPool}
            currentPrice={wizardData.currentPrice}
            priceRange={wizardData.priceRange}
            onPriceRangeChange={handlePriceRangeChange}
          />
        );
      case 3:
        return (
          <Step3TokenAmounts
            selectedPool={wizardData.selectedPool}
            currentPrice={wizardData.currentPrice}
            priceRange={wizardData.priceRange}
            tokenAmounts={wizardData.tokenAmounts}
            onTokenAmountsChange={handleTokenAmountsChange}
          />
        );
      case 4:
        return (
          <Step4Summary
            selectedPool={wizardData.selectedPool}
            currentPrice={wizardData.currentPrice}
            priceRange={wizardData.priceRange}
            tokenAmounts={wizardData.tokenAmounts}
          />
        );
      default:
        return null;
    }
  };

  const steps = [
    { number: 1, title: t('wizard.steps.selectPool') },
    { number: 2, title: t('wizard.steps.setRange') },
    { number: 3, title: t('wizard.steps.depositAmount') },
    { number: 4, title: t('wizard.steps.summary') },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex gap-2 mb-3">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-all duration-300",
                step < currentStep && "bg-primary",
                step === currentStep && "bg-primary animate-pulse-data",
                step > currentStep && "bg-muted"
              )}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            <span className="text-muted-foreground">Step {currentStep} of 4:</span>
            <span className="ml-2 text-foreground">{steps[currentStep - 1]?.title}</span>
          </p>
          <span className="text-xs text-muted-foreground font-mono">
            {Math.round((currentStep / 4) * 100)}%
          </span>
        </div>
      </div>

      {/* Step Indicator */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      currentStep === step.number
                        ? 'bg-primary text-primary-foreground shadow-lg animate-pulse-data'
                        : currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <p
                    className={`mt-2 text-sm font-medium hidden sm:block ${
                      currentStep === step.number
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-4 rounded-full transition-all ${
                      currentStep > step.number
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="mb-8">{renderStep()}</div>

      {/* Navigation Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="btn-terminal-secondary flex-1 sm:flex-none h-12 sm:h-auto gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t('wizard.navigation.back')}</span>
            </Button>

            <div className="text-sm text-muted-foreground hidden sm:block">
              {t('wizard.navigation.stepOf', { current: currentStep, total: steps.length })}
            </div>

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="btn-terminal-primary flex-1 sm:flex-none h-12 sm:h-auto gap-2 cursor-pointer"
                title={!canProceed() ? "Complete required fields to continue" : ""}
              >
                <span>{t('wizard.navigation.next')}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                className="flex-1 sm:flex-none h-12 sm:h-auto gap-2 bg-green-500 hover:bg-green-600 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{t('wizard.navigation.createPosition')}</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
