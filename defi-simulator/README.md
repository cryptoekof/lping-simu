# DeFi Liquidity Pool Simulator MVP

An interactive web application for simulating Uniswap V3 liquidity provision with real-time market data from the Coinbase API.

## Features

- **Real-Time Price Data**: Fetches live cryptocurrency prices from Coinbase API for ETH, BTC, and SOL
- **Pool Selection**: Choose from three liquidity pools (ETH/USDC, BTC/USDC, SOL/USDC)
- **Treasury Management**: Allocate virtual funds across selected pools
- **Fee Simulation**: Linear fee generation model based on realistic APR estimates
- **Impermanent Loss Calculation**: Real-time IL tracking based on price movements
- **Educational Content**: Comprehensive explanations of LPing, APR, and impermanent loss
- **Data Persistence**: All simulation data saved in browser localStorage

## Tech Stack

- **Frontend Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Data Source**: Coinbase API (free tier)
- **Storage**: Browser localStorage

## Getting Started

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd defi-simulator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## How to Use

### 1. Set Your Treasury
Start with a virtual treasury amount (default $10,000) that you want to allocate to liquidity pools.

### 2. Select Pools
Choose one or more pools from:
- **ETH/USDC** - 5% base APR
- **BTC/USDC** - 4% base APR
- **SOL/USDC** - 8% base APR

Real-time prices are fetched from Coinbase API.

### 3. Allocate Funds
Use the sliders or input fields to distribute your treasury across selected pools. You can:
- Manually adjust allocations
- Use "Auto Allocate Equally" to split funds evenly
- See real-time allocation progress

### 4. Start Simulation
Click "Start Simulation" to begin tracking:
- **Fees Earned**: Based on linear fee generation model
- **Impermanent Loss**: Calculated from price movements
- **Net Returns**: Total value including fees minus IL

### 5. Monitor Results
The simulation tracks:
- Days elapsed since start
- Current vs initial prices for each pool
- Fees generated per pool
- Impermanent loss per pool
- Overall portfolio performance

## Educational Content

The app includes comprehensive explanations of:

- **Liquidity Provision (LPing)**: How providing liquidity works in AMMs
- **Annual Percentage Rate (APR)**: Understanding returns from trading fees
- **Impermanent Loss**: What it is and how to calculate it
- **Risk vs Reward**: Balancing fee generation against IL

## Data Persistence

All simulation data is stored in browser localStorage:
- Treasury amount
- Pool allocations
- Initial prices (for IL calculation)
- Simulation start date

Data persists across browser sessions. Use "Reset Simulation" to clear all data.

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── input.jsx
│   │   └── slider.jsx
│   ├── EducationalContent.jsx
│   ├── FeeSimulation.jsx
│   ├── PoolSelector.jsx
│   └── TreasuryAllocation.jsx
├── pages/
│   ├── Dashboard.jsx    # Main simulation interface
│   └── Home.jsx         # Landing page
├── utils/
│   ├── api.js           # Coinbase API integration
│   └── storage.js       # localStorage management
├── lib/
│   └── utils.js         # Utility functions
├── App.jsx              # Root component
└── index.css            # Global styles
```

## API Integration

The app uses the Coinbase API (no authentication required):

```javascript
// Endpoint
https://api.coinbase.com/v2/prices/{pair}/spot

// Supported pairs
- ETH-USD
- BTC-USD
- SOL-USD
```

## Simulation Logic

### Fee Calculation
```javascript
fees = (allocation * APR * daysElapsed) / 365
```

### Impermanent Loss
```javascript
priceRatio = currentPrice / initialPrice
IL = 2 * sqrt(priceRatio) / (1 + priceRatio) - 1
```

### Total Value
```javascript
finalValue = initialValue + fees - impermanentLoss
netReturn = finalValue - initialValue
```

## Limitations

- **Simplified Model**: Uses linear fee generation for educational purposes
- **No Gas Fees**: Does not account for transaction costs
- **Fixed APRs**: Real APRs vary with trading volume and volatility
- **Price-Based IL Only**: Doesn't account for concentrated liquidity ranges
- **No Rebalancing**: Assumes passive LP position

## Disclaimer

This simulator is for **educational purposes only**. It uses simplified models and should not be considered financial advice. Real-world DeFi returns vary based on:
- Trading volume
- Market volatility
- Fee tiers
- Liquidity concentration
- Gas costs
- Smart contract risks

Always do your own research before investing real capital in DeFi protocols.

## Future Enhancements

Potential features for future versions:
- Historical price charts
- Multiple simulation scenarios
- Advanced IL strategies
- Gas fee estimation
- More pool options
- Export simulation results
- Concentrated liquidity range selection

## License

MIT

## Contributing

This is an educational MVP. Contributions welcome!

## Support

For issues or questions, please open an issue on the GitHub repository.
