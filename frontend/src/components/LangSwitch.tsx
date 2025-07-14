'use client';

import { useTranslation } from 'react-i18next';
import { Language } from '@/enums';
import { cn } from '@/lib/utils';

import '@/i18n';

export function LangSwitch() {
    const { i18n } = useTranslation();

    const selectedLang = i18n.language === 'ru' ? 'ru' : 'ro';

    const handleLanguageChange = () => {
        const newLang = selectedLang === Language.RU ? Language.RO : Language.RU;
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="rounded-full px-3 py-1 bg-[#263796] text-white/50 cursor-pointer" onClick={handleLanguageChange}>
            <span className={cn(selectedLang === Language.RU && 'text-white')}>Ru</span>
            /
            <span className={cn(selectedLang === Language.RO && 'text-white')}>Ro</span>
        </div>
    );
}
