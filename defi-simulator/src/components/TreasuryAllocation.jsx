import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { POOLS } from '../utils/api';

export default function TreasuryAllocation({
  treasury,
  setTreasury,
  selectedPools,
  allocations,
  setAllocations,
  onStartSimulation,
}) {
  const [tempAllocations, setTempAllocations] = useState({});
  const [treasuryInput, setTreasuryInput] = useState(treasury.toString());

  useEffect(() => {
    setTempAllocations(allocations);
  }, [allocations]);

  const totalAllocated = Object.values(tempAllocations).reduce(
    (sum, val) => sum + val,
    0
  );
  const remaining = treasury - totalAllocated;
  const allocationPercentage = treasury > 0 ? (totalAllocated / treasury) * 100 : 0;

  const handleAllocationChange = (poolId, value) => {
    const numValue = parseFloat(value) || 0;
    const maxAllocation = treasury - (totalAllocated - (tempAllocations[poolId] || 0));
    const finalValue = Math.min(numValue, maxAllocation);

    setTempAllocations({
      ...tempAllocations,
      [poolId]: Math.max(0, finalValue),
    });
  };

  const handleSliderChange = (poolId, percentage) => {
    const value = (treasury * percentage) / 100;
    handleAllocationChange(poolId, value);
  };

  const handleApplyAllocations = () => {
    setAllocations(tempAllocations);
  };

  const handleTreasuryChange = () => {
    const newTreasury = parseFloat(treasuryInput) || 0;
    if (newTreasury > 0) {
      setTreasury(newTreasury);
      // Reset allocations if new treasury is smaller than current allocations
      if (newTreasury < totalAllocated) {
        setTempAllocations({});
      }
    }
  };

  const handleAutoAllocate = () => {
    if (selectedPools.length === 0) return;

    const amountPerPool = treasury / selectedPools.length;
    const newAllocations = {};

    selectedPools.forEach((poolId) => {
      newAllocations[poolId] = amountPerPool;
    });

    setTempAllocations(newAllocations);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Treasury Allocation</CardTitle>
        <CardDescription>
          Allocate your treasury across selected pools
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Treasury Input */}
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <label className="block text-sm font-medium mb-2">
            Total Treasury Amount
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={treasuryInput}
              onChange={(e) => setTreasuryInput(e.target.value)}
              onBlur={handleTreasuryChange}
              placeholder="Enter treasury amount"
              className="flex-1"
            />
            <Button onClick={handleTreasuryChange} variant="secondary">
              Update
            </Button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="font-semibold">{formatCurrency(treasury)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Allocated</p>
              <p className="font-semibold text-primary">
                {formatCurrency(totalAllocated)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Remaining</p>
              <p className="font-semibold text-green-600">
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Allocation Progress</span>
              <span>{allocationPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${Math.min(allocationPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pool Allocations */}
        {selectedPools.length > 0 ? (
          <>
            <div className="space-y-4 mb-4">
              {selectedPools.map((poolId) => {
                const pool = Object.values(POOLS).find((p) => p.id === poolId);
                const allocation = tempAllocations[poolId] || 0;
                const percentage = treasury > 0 ? (allocation / treasury) * 100 : 0;

                return (
                  <div key={poolId} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: pool.color }}
                        />
                        <span className="font-semibold">{pool.name}</span>
                      </div>
                      <div className="text-right">
                        <Input
                          type="number"
                          value={allocation}
                          onChange={(e) =>
                            handleAllocationChange(poolId, e.target.value)
                          }
                          className="w-32 text-right"
                          step="100"
                          min="0"
                          max={treasury}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={percentage}
                        onChange={(e) =>
                          handleSliderChange(poolId, parseFloat(e.target.value))
                        }
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(allocation)}</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAutoAllocate} variant="outline" className="flex-1">
                Auto Allocate Equally
              </Button>
              <Button onClick={handleApplyAllocations} className="flex-1">
                Apply Allocations
              </Button>
              <Button
                onClick={onStartSimulation}
                disabled={totalAllocated === 0}
                variant="default"
                className="flex-1"
              >
                Start Simulation
              </Button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center bg-muted rounded-lg">
            <p className="text-muted-foreground">
              Please select at least one pool above to start allocating your treasury
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
