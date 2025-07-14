'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { LangSwitch } from './LangSwitch';
import Logo from './Logo';

export function Header() {
    const { t } = useTranslation();

    return (
        <header className="shadow-2xs py-4">
            <div className="px-4 max-w-7xl flex justify-between items-center gap-4 m-auto">
                <Logo />
                <div className="hidden md:flex items-baseline gap-9">
                    <Link href="/main#petition">{t('header_link.1')}</Link>
                    <Link href="/main#how-it-works">{t('header_link.2')}</Link>
                    <Link href="/main/status">{t('header_link.3')}</Link>
                    {/* <Link href="/main">{t('header_link.4')}</Link> */}
                    <LangSwitch />
                </div>
                <div className="md:hidden">
                    <LangSwitch />
                </div>
            </div>
        </header>
    );
}
