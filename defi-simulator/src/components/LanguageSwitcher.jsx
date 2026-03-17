import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { Button } from './ui/button';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  const getCurrentLanguage = () => {
    return i18n.language === 'es' ? 'ES' : 'EN';
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2 hover:bg-primary/10 transition-all"
      title={i18n.language === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
    >
      <Languages className="w-4 h-4" />
      <span className="font-semibold">{getCurrentLanguage()}</span>
    </Button>
  );
}
