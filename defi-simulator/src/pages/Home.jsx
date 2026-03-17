import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { TrendingUp, Shield, BookOpen, Zap, BarChart3, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Activity className="w-7 h-7" />,
      title: t('home.features.liveData.title'),
      description: t('home.features.liveData.description'),
    },
    {
      icon: <BarChart3 className="w-7 h-7" />,
      title: t('home.features.feeSimulation.title'),
      description: t('home.features.feeSimulation.description'),
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: t('home.features.riskAnalytics.title'),
      description: t('home.features.riskAnalytics.description'),
    },
    {
      icon: <BookOpen className="w-7 h-7" />,
      title: t('home.features.education.title'),
      description: t('home.features.education.description'),
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-32">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8 animate-fade-in-up">
            <div className="badge-data">
              <Zap className="w-3.5 h-3.5" />
              <span>{t('home.badge')}</span>
            </div>
          </div>

          {/* Hero Text */}
          <div className="text-center mb-12 space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-gradient-terminal animate-fade-in-up animate-delay-100">
              {t('home.title')}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up animate-delay-200">
              {t('home.subtitle')}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-fade-in-up animate-delay-300">
            <Link to="/simulator">
              <Button size="lg" className="btn-terminal-primary text-base px-8 py-6 glow-primary">
                {t('home.cta.launch')}
              </Button>
            </Link>
            <Link to="/learn">
              <Button size="lg" variant="outline" className="btn-terminal-secondary text-base px-8 py-6">
                {t('home.cta.docs')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {features.map((feature, idx) => (
            <Card
              key={idx}
              className="card-terminal text-center group animate-fade-in-up"
              style={{
                animationDelay: `${(idx + 4) * 100}ms`,
                animationFillMode: 'backwards'
              }}
            >
              <CardContent className="pt-8 pb-6 px-5">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 text-primary mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 border border-primary/20">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-base mb-2.5 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-32 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">{t('home.howItWorks.title')}</h2>
            <p className="text-muted-foreground">{t('home.howItWorks.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-5 group">
              <div className="flex-shrink-0">
                <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-lg border border-primary/20 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  01
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{t('home.howItWorks.steps.step1.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('home.howItWorks.steps.step1.description')}
                </p>
              </div>
            </div>

            <div className="flex gap-5 group">
              <div className="flex-shrink-0">
                <div className="w-11 h-11 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-mono font-bold text-lg border border-secondary/20 group-hover:bg-secondary/20 group-hover:scale-110 transition-all duration-300">
                  02
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{t('home.howItWorks.steps.step2.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('home.howItWorks.steps.step2.description')}
                </p>
              </div>
            </div>

            <div className="flex gap-5 group">
              <div className="flex-shrink-0">
                <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-lg border border-primary/20 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  03
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{t('home.howItWorks.steps.step3.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('home.howItWorks.steps.step3.description')}
                </p>
              </div>
            </div>

            <div className="flex gap-5 group">
              <div className="flex-shrink-0">
                <div className="w-11 h-11 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-mono font-bold text-lg border border-secondary/20 group-hover:bg-secondary/20 group-hover:scale-110 transition-all duration-300">
                  04
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{t('home.howItWorks.steps.step4.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('home.howItWorks.steps.step4.description')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-24 max-w-3xl mx-auto">
          <Card className="glass-card border-secondary/30 bg-secondary/5">
            <CardContent className="p-6 sm:p-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 text-secondary flex items-center justify-center border border-secondary/30">
                    <Shield className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t('home.disclaimer.title')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('home.disclaimer.description')}
                    <span className="block mt-2 text-foreground font-medium">
                      {t('home.disclaimer.footer')}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Final CTA */}
        <div className="mt-16 mb-12 text-center">
          <p className="text-muted-foreground mb-6">{t('home.finalCta.text')}</p>
          <Link to="/simulator">
            <Button size="lg" className="btn-terminal-primary text-base px-10 py-6">
              {t('home.finalCta.button')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
