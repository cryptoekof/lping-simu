import EducationalContent from '../components/EducationalContent';
import { useTranslation } from 'react-i18next';

export default function Learn() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient-terminal mb-2">
            {t('learn.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('learn.subtitle')}
          </p>
        </div>

        <EducationalContent />

        {/* Additional Learning Resources */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl">
            <h3 className="text-xl font-semibold mb-3">{t('learn.quickTips.title')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{t('learn.quickTips.tip1')}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{t('learn.quickTips.tip2')}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{t('learn.quickTips.tip3')}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{t('learn.quickTips.tip4')}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{t('learn.quickTips.tip5')}</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl">
            <h3 className="text-xl font-semibold mb-3">{t('learn.keyMetrics.title')}</h3>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-sm">{t('learn.keyMetrics.priceRatio.title')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('learn.keyMetrics.priceRatio.description')}
                </p>
              </div>
              <div>
                <p className="font-semibold text-sm">{t('learn.keyMetrics.feeRate.title')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('learn.keyMetrics.feeRate.description')}
                </p>
              </div>
              <div>
                <p className="font-semibold text-sm">{t('learn.keyMetrics.netReturn.title')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('learn.keyMetrics.netReturn.description')}
                </p>
              </div>
              <div>
                <p className="font-semibold text-sm">{t('learn.keyMetrics.daysElapsed.title')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('learn.keyMetrics.daysElapsed.description')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* External Resources */}
        <div className="mt-12 p-8 rounded-2xl border-2 border-primary/20 bg-primary/5 backdrop-blur-xl">
          <h3 className="text-2xl font-semibold mb-4">{t('learn.resources.title')}</h3>
          <p className="text-muted-foreground mb-6">
            {t('learn.resources.description')}
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="https://uniswap.org/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 transition-all hover:-translate-y-1 cursor-pointer"
            >
              <p className="font-semibold mb-1">{t('learn.resources.uniswap.title')}</p>
              <p className="text-xs text-muted-foreground">
                {t('learn.resources.uniswap.description')}
              </p>
            </a>
            <a
              href="https://ethereum.org/en/defi/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 transition-all hover:-translate-y-1 cursor-pointer"
            >
              <p className="font-semibold mb-1">{t('learn.resources.ethereum.title')}</p>
              <p className="text-xs text-muted-foreground">
                {t('learn.resources.ethereum.description')}
              </p>
            </a>
            <a
              href="https://academy.binance.com/en/articles/impermanent-loss-explained"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 transition-all hover:-translate-y-1 cursor-pointer"
            >
              <p className="font-semibold mb-1">{t('learn.resources.il.title')}</p>
              <p className="text-xs text-muted-foreground">
                {t('learn.resources.il.description')}
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
