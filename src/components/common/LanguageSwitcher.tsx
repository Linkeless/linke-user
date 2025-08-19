/**
 * Language Switcher Component
 *
 * Provides a dropdown to switch between supported languages.
 * Integrates with react-i18next for language management.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import type { SupportedLanguages } from '@/lib/i18n';

/**
 * Language configuration
 */
const languages: {
  code: SupportedLanguages;
  name: string;
  nativeName: string;
}[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
];

/**
 * Props for LanguageSwitcher component
 */
export interface LanguageSwitcherProps {
  /** Optional custom className */
  className?: string;
  /** Show as mobile menu item */
  asMobileItem?: boolean;
}

/**
 * LanguageSwitcher component
 *
 * Features:
 * - Dropdown menu with available languages
 * - Current language indicator
 * - Smooth language switching
 * - Mobile-friendly design
 */
export function LanguageSwitcher({
  className,
  asMobileItem = false,
}: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();

  /**
   * Handle language change
   */
  const changeLanguage = (languageCode: SupportedLanguages) => {
    i18n.changeLanguage(languageCode);
  };

  /**
   * Get current language info
   */
  const _currentLanguage =
    languages.find(lang => lang.code === i18n.language) || languages[0];

  if (asMobileItem) {
    return (
      <div className={`space-y-2 ${className || ''}`}>
        <p className='font-medium text-foreground mb-3'>
          {t('common:language.switchTo', { language: '' }).replace(' ', '')}
        </p>
        {languages.map(language => (
          <Button
            key={language.code}
            variant={i18n.language === language.code ? 'default' : 'ghost'}
            className='w-full justify-start'
            onClick={() => changeLanguage(language.code)}
          >
            <Globe className='h-4 w-4 mr-2' />
            {language.nativeName}
            {i18n.language === language.code && (
              <span className='ml-auto text-xs'>✓</span>
            )}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className={`h-9 w-9 ${className || ''}`}
          aria-label='Switch language'
        >
          <Globe className='h-4 w-4' />
          <span className='sr-only'>Switch language</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-sm'>
        <div className='space-y-4'>
          <div>
            <h2 className='text-lg font-semibold text-foreground mb-2'>
              {t('common:language.switchTo', { language: '' }).replace(
                ' {{language}}',
                ''
              )}
            </h2>
            <p className='text-sm text-muted-foreground'>
              Choose your preferred language
            </p>
          </div>

          <div className='space-y-2'>
            {languages.map(language => (
              <Button
                key={language.code}
                variant={i18n.language === language.code ? 'default' : 'ghost'}
                className='w-full justify-start'
                onClick={() => changeLanguage(language.code)}
              >
                <Globe className='h-4 w-4 mr-2' />
                <div className='flex-1 text-left'>
                  <div className='font-medium'>{language.nativeName}</div>
                  <div className='text-xs text-muted-foreground'>
                    {language.name}
                  </div>
                </div>
                {i18n.language === language.code && (
                  <span className='text-primary'>✓</span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Default export
 */
export default LanguageSwitcher;
