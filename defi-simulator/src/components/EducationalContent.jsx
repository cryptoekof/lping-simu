import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Info, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';

export default function EducationalContent() {
  const topics = [
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: 'Liquidity Provision (LPing)',
      color: 'blue',
      content: [
        'Liquidity providers deposit token pairs into decentralized exchange pools to enable trading.',
        'In return, LPs earn a share of trading fees proportional to their contribution to the pool.',
        'Uniswap V3 allows concentrated liquidity, letting LPs choose specific price ranges for higher capital efficiency.',
        'Your capital earns fees whenever trades occur within your chosen price range.',
      ],
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Annual Percentage Rate (APR)',
      color: 'green',
      content: [
        'APR represents the yearly return rate from trading fees earned by liquidity providers.',
        'Higher trading volume typically means higher fees and better APR for LPs.',
        'The base APR in this simulator is a simplified estimate - real APRs vary based on market conditions.',
        'Actual returns depend on trading volume, fee tier (0.05%, 0.3%, 1%), and price volatility.',
      ],
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: 'Impermanent Loss (IL)',
      color: 'red',
      content: [
        'Impermanent loss occurs when the price ratio of your deposited tokens changes compared to when you deposited them.',
        'If prices diverge significantly, you may end up with less value than if you had just held the tokens.',
        'IL is "impermanent" because it can be recovered if prices return to their original ratio.',
        'Formula: IL = 2√(price_ratio)/(1+price_ratio) - 1, where price_ratio = current_price/initial_price',
        'Example: If ETH doubles in price vs USDC, you experience ~5.7% impermanent loss.',
      ],
    },
    {
      icon: <Info className="w-5 h-5" />,
      title: 'Risk vs Reward',
      color: 'purple',
      content: [
        'Successful LPing requires fees earned to exceed impermanent loss.',
        'Stable pairs (like stablecoin pairs) have minimal IL but lower fees.',
        'Volatile pairs can generate high fees but risk significant IL.',
        'Diversifying across multiple pools can help balance risk and returns.',
        'Always consider your risk tolerance and market outlook before providing liquidity.',
      ],
    },
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950',
      icon: 'text-blue-600',
      border: 'border-blue-200 dark:border-blue-800',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-950',
      icon: 'text-green-600',
      border: 'border-green-200 dark:border-green-800',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-950',
      icon: 'text-red-600',
      border: 'border-red-200 dark:border-red-800',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950',
      icon: 'text-purple-600',
      border: 'border-purple-200 dark:border-purple-800',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Educational Resources</CardTitle>
        <CardDescription>
          Learn about key DeFi concepts to make informed decisions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {topics.map((topic) => {
            const colors = colorClasses[topic.color];
            return (
              <div
                key={topic.title}
                className={`p-4 rounded-lg border-2 ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`mt-1 ${colors.icon}`}>
                    {topic.icon}
                  </div>
                  <h3 className="font-semibold text-lg">{topic.title}</h3>
                </div>
                <ul className="space-y-2">
                  {topic.content.map((item, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Quick Tips */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Simulator Tips
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• This simulator uses linear fee generation for simplicity</li>
            <li>• Real-world returns vary based on actual trading volume and market conditions</li>
            <li>• Prices are fetched from Coinbase API in real-time</li>
            <li>• Days elapsed updates to show how your returns accumulate over time</li>
            <li>• Your simulation data is saved in browser storage and persists across sessions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
