import { useState, useEffect } from 'react';
import PoolSelector from '../components/PoolSelector';
import TreasuryAllocation from '../components/TreasuryAllocation';
import FeeSimulation from '../components/FeeSimulation';
import EducationalContent from '../components/EducationalContent';
import {
  loadTreasury,
  saveTreasury,
  loadAllocations,
  saveAllocations,
  loadInitialPrices,
  saveInitialPrices,
  loadStartDate,
  saveStartDate,
  resetSimulation,
} from '../utils/storage';

export default function Dashboard() {
  const [treasury, setTreasury] = useState(10000);
  const [selectedPools, setSelectedPools] = useState([]);
  const [allocations, setAllocations] = useState({});
  const [prices, setPrices] = useState({});
  const [initialPrices, setInitialPrices] = useState({});
  const [simulationActive, setSimulationActive] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    const savedTreasury = loadTreasury();
    const savedAllocations = loadAllocations();
    const savedInitialPrices = loadInitialPrices();
    const savedStartDate = loadStartDate();

    setTreasury(savedTreasury);
    setAllocations(savedAllocations);
    setInitialPrices(savedInitialPrices);

    // Determine which pools are selected based on allocations
    const poolsWithAllocations = Object.entries(savedAllocations)
      .filter(([_, amount]) => amount > 0)
      .map(([poolId]) => poolId);

    setSelectedPools(poolsWithAllocations);

    // Check if simulation is active
    const hasAllocations = Object.values(savedAllocations).some(amount => amount > 0);
    const hasInitialPrices = Object.keys(savedInitialPrices).length > 0;
    setSimulationActive(hasAllocations && hasInitialPrices);
  }, []);

  // Save treasury when it changes
  useEffect(() => {
    saveTreasury(treasury);
  }, [treasury]);

  // Save allocations when they change
  useEffect(() => {
    saveAllocations(allocations);
  }, [allocations]);

  const handlePoolToggle = (poolId) => {
    setSelectedPools((prev) => {
      if (prev.includes(poolId)) {
        // Remove pool and its allocation
        const newAllocations = { ...allocations };
        delete newAllocations[poolId];
        setAllocations(newAllocations);
        return prev.filter((id) => id !== poolId);
      } else {
        return [...prev, poolId];
      }
    });
  };

  const handleStartSimulation = () => {
    if (Object.values(allocations).every(amount => amount === 0)) {
      alert('Please allocate funds to at least one pool before starting the simulation.');
      return;
    }

    // Save initial prices for IL calculation
    const initPrices = {};
    Object.keys(allocations).forEach((poolId) => {
      if (allocations[poolId] > 0 && prices[poolId]) {
        initPrices[poolId] = prices[poolId].currentPrice;
      }
    });

    setInitialPrices(initPrices);
    saveInitialPrices(initPrices);

    // Save start date
    const startDate = new Date().toISOString();
    saveStartDate(startDate);

    setSimulationActive(true);
  };

  const handleResetSimulation = () => {
    if (confirm('Are you sure you want to reset the simulation? This will clear all allocation data.')) {
      resetSimulation();
      setAllocations({});
      setInitialPrices({});
      setSimulationActive(false);
      setSelectedPools([]);
    }
  };

  return (
    <div className="min-h-screen uni-bg-gradient">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gradient-uni">DeFi Liquidity Pool Simulator</h1>
          <p className="text-muted-foreground mt-1">
            Simulate Uniswap V3 liquidity provision with real-time data
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Educational Content - Always visible */}
          <EducationalContent />

          {/* Pool Selection */}
          {!simulationActive && (
            <PoolSelector
              selectedPools={selectedPools}
              onPoolToggle={handlePoolToggle}
              prices={prices}
              setPrices={setPrices}
            />
          )}

          {/* Treasury Allocation */}
          {!simulationActive && (
            <TreasuryAllocation
              treasury={treasury}
              setTreasury={setTreasury}
              selectedPools={selectedPools}
              allocations={allocations}
              setAllocations={setAllocations}
              onStartSimulation={handleStartSimulation}
            />
          )}

          {/* Fee Simulation Results */}
          <FeeSimulation
            allocations={allocations}
            prices={prices}
            initialPrices={initialPrices}
            simulationActive={simulationActive}
            onReset={handleResetSimulation}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-6 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>DeFi Simulator MVP - Educational purposes only</p>
          <p className="mt-1">Data provided by Coinbase API • Not financial advice</p>
        </div>
      </footer>
    </div>
  );
}
