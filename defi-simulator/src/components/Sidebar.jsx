import { NavLink } from 'react-router-dom';
import { Home, Activity, BookOpen, Menu, X, Wallet, BarChart2, Calculator, Zap } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const navItems = [
    {
      path: '/',
      label: t('sidebar.nav.home'),
      icon: <Home className="w-4.5 h-4.5" />,
    },
    {
      path: '/simulator',
      label: t('sidebar.nav.simulator'),
      icon: <Activity className="w-4.5 h-4.5" />,
    },
    {
      path: '/positions',
      label: t('sidebar.nav.positions'),
      icon: <Wallet className="w-4.5 h-4.5" />,
    },
    {
      path: '/calculator',
      label: t('sidebar.nav.calculator'),
      icon: <Calculator className="w-4.5 h-4.5" />,
    },
    {
      path: '/flash-loan',
      label: t('sidebar.nav.flashLoan'),
      icon: <Zap className="w-4.5 h-4.5" />,
    },
    {
      path: '/learn',
      label: t('sidebar.nav.learn'),
      icon: <BookOpen className="w-4.5 h-4.5" />,
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        className="fixed top-4 left-4 z-50 lg:hidden glass-card p-3 rounded-lg shadow-lg hover:bg-card/60 transition-all cursor-pointer focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40
          w-72 glass-card border-r border-border/50
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo/Title */}
          <div className="mb-10 pb-6 border-b border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <BarChart2 className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-gradient-terminal">
                {t('sidebar.title')}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground font-mono ml-10">
              {t('sidebar.subtitle')}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent'
                  }`
                }
              >
                {item.icon}
                <span className="font-medium text-sm">{item.label}</span>
                <div className="ml-auto w-1 h-1 rounded-full bg-current opacity-0 group-hover:opacity-50 transition-opacity" />
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="mt-auto pt-6 border-t border-border/30 space-y-4">
            <div className="flex justify-center">
              <LanguageSwitcher />
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-mono text-secondary">⚠</span> {t('sidebar.disclaimer')}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Spacer for desktop */}
      <div className="hidden lg:block w-72 flex-shrink-0" />
    </>
  );
}
