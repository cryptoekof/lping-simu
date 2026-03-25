import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { POOLS, calculateDynamicAPR } from '../utils/api';
import { getPositionStatus } from '../utils/uniswapV3Math';
import { fetchAllPrices } from '../utils/api';
import { Check, TrendingUp, TrendingDown, Trash2, Plus, X, Download, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { LoadingDots } from '../components/ui/loading';

export default function Positions() {
  const { t } = useTranslation();
  const [positions, setPositions] = useState([]);
  const [prices, setPrices] = useState({});
  const [filter, setFilter] = useState('open');
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Load positions from localStorage
  useEffect(() => {
    const savedPositions = localStorage.getItem('positions');
    if (savedPositions) {
      setPositions(JSON.parse(savedPositions));
    }
  }, []);

  // Fetch current prices
  useEffect(() => {
    const updatePrices = async () => {
      try {
        const newPrices = await fetchAllPrices();
        setPrices(newPrices);
        setIsLoadingPrices(false);
      } catch (error) {
        console.error('Failed to fetch prices:', error);
        setIsLoadingPrices(false);
      }
    };

    updatePrices();
    const interval = setInterval(updatePrices, 30000);

    return () => clearInterval(interval);
  }, []);

  const closePosition = (id) => {
    const newPositions = positions.map(p =>
      p.id === id ? { ...p, closed: true, closedAt: new Date().toISOString() } : p
    );
    setPositions(newPositions);
    localStorage.setItem('positions', JSON.stringify(newPositions));
    toast.success('Position closed');
  };

  const deletePosition = (id) => {
    if (confirmDeleteId === id) {
      const newPositions = positions.filter(p => p.id !== id);
      setPositions(newPositions);
      localStorage.setItem('positions', JSON.stringify(newPositions));
      setConfirmDeleteId(null);
      toast.success('Position deleted');
    } else {
      setConfirmDeleteId(id);
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(positions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `defi-positions-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Positions exported successfully!');
  };

  // Filter positions based on open/closed status
  const filteredPositions = positions.filter(p =>
    filter === 'open' ? !p.closed : p.closed
  );

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(num);
  };

  const StatusIcon = ({ status }) => {
    if (status === 'in_range') {
      return <Check className="w-6 h-6 text-green-500" />;
    } else if (status === 'below_range') {
      return <TrendingDown className="w-6 h-6 text-yellow-500" />;
    } else {
      return <TrendingUp className="w-6 h-6 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gradient-terminal mb-2">
              {t('positions.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('positions.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            {positions.length > 0 && (
              <Button
                onClick={handleExport}
                variant="outline"
                className="btn-terminal-secondary cursor-pointer"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
            <Link to="/simulator">
              <Button className="btn-terminal-primary cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                {t('positions.newPosition')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        {positions.length > 0 && (
          <div className="mb-6 flex gap-2">
            <Button
              variant={filter === 'open' ? 'default' : 'outline'}
              onClick={() => setFilter('open')}
              className={filter === 'open' ? 'btn-terminal-primary' : 'cursor-pointer'}
            >
              {t('positions.filters.open')} ({positions.filter(p => !p.closed).length})
            </Button>
            <Button
              variant={filter === 'closed' ? 'default' : 'outline'}
              onClick={() => setFilter('closed')}
              className={filter === 'closed' ? 'btn-terminal-primary' : 'cursor-pointer'}
            >
              {t('positions.filters.closed')} ({positions.filter(p => p.closed).length})
            </Button>
          </div>
        )}

        {positions.length === 0 ? (
          <Card className="glass-card text-center py-16">
            <CardContent>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                <Wallet className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{t('positions.empty.title')}</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {t('positions.empty.description')}
              </p>
              <Link to="/simulator">
                <Button className="btn-terminal-primary cursor-pointer">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('positions.empty.button')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : filteredPositions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground">
                No {filter} positions
              </p>
            </CardContent>
          </Card>
        ) : isLoadingPrices ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <LoadingDots />
            <span className="text-muted-foreground text-sm">Loading position data...</span>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredPositions.map((position) => {
              const pool = Object.values(POOLS).find(p => p.id === position.poolId);
              const currentPrice = prices[position.poolId]?.currentPrice || position.initialPrice;

              const positionStatus = getPositionStatus(
                currentPrice,
                position.priceRange.lower,
                position.priceRange.upper,
                position.tokenAmounts.amount0,
                position.tokenAmounts.amount1,
                position.initialPrice,
                position.liquidity ?? null
              );

              const apr = calculateDynamicAPR(
                position.poolId,
                currentPrice,
                position.priceRange.lower,
                position.priceRange.upper
              );

              const rangeWidth = ((position.priceRange.upper - position.priceRange.lower) / currentPrice) * 100;

              return (
                <Card
                  key={position.id}
                  className={`cursor-default transition-all ${
                    positionStatus.inRange
                      ? 'border-green-500/50'
                      : 'border-yellow-500/50'
                  }`}
                  style={{
                    borderLeftWidth: '3px',
                    borderLeftColor: pool?.color,
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: pool?.color }}
                          />
                          {pool?.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-mono text-xs">{position.id.slice(0, 8)}...</span>
                          {' • '}Created {new Date(position.createdAt).toLocaleDateString()}
                          {position.closed && position.closedAt && (
                            <> • Closed {new Date(position.closedAt).toLocaleDateString()}</>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {!position.closed && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => closePosition(position.id)}
                            className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 cursor-pointer"
                            title="Close position"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePosition(position.id)}
                          className={`cursor-pointer ${
                            confirmDeleteId === position.id
                              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                              : 'text-destructive hover:text-destructive hover:bg-destructive/10'
                          }`}
                          title={confirmDeleteId === position.id ? 'Click again to confirm delete' : 'Delete position'}
                        >
                          <Trash2 className="w-4 h-4" />
                          {confirmDeleteId === position.id && (
                            <span className="ml-1 text-xs">Confirm?</span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Status */}
                      <div className={`flex items-center gap-3 p-3 rounded-lg ${
                        positionStatus.inRange
                          ? 'bg-green-50 dark:bg-green-950'
                          : 'bg-yellow-50 dark:bg-yellow-950'
                      }`}>
                        <StatusIcon status={positionStatus.status} />
                        <div>
                          <p className="font-semibold">
                            {positionStatus.inRange ? 'In Range' : 'Out of Range'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {positionStatus.status === 'in_range' && 'Earning fees'}
                            {positionStatus.status === 'below_range' && '100% ' + pool?.token0}
                            {positionStatus.status === 'above_range' && '100% ' + pool?.token1}
                          </p>
                        </div>
                      </div>

                      {/* Position Value */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Position Value</p>
                          <p className="text-xl font-bold">{formatCurrency(positionStatus.totalValue)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Est. APR</p>
                          <p className="text-xl font-bold text-green-600">{(apr * 100).toFixed(1)}%</p>
                        </div>
                      </div>

                      {/* Price Info */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current Price</span>
                          <span className="font-mono font-semibold">{formatCurrency(currentPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price Range</span>
                          <span className="font-mono">
                            {formatCurrency(position.priceRange.lower)} - {formatCurrency(position.priceRange.upper)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Range Width</span>
                          <span>{rangeWidth.toFixed(1)}%</span>
                        </div>
                      </div>

                       {/* Token Amounts */}
                       <div className="pt-3 border-t border-border/50 space-y-2 text-sm">
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">{pool?.token0}</span>
                           <span className="font-mono">
                             {formatNumber(positionStatus.amount0)} ({positionStatus.proportion0.toFixed(1)}%)
                           </span>
                         </div>
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">{pool?.token1}</span>
                           <span className="font-mono">
                             {formatNumber(positionStatus.amount1)} ({positionStatus.proportion1.toFixed(1)}%)
                           </span>
                         </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
