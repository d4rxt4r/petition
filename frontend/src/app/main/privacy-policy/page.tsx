'use client';

import { useTranslation } from 'react-i18next';

import '@/i18n';

export default function PrivacyPolicy() {
    const { t } = useTranslation();

    return (
        <section className="px-4 max-w-7xl m-auto flex flex-col py-10">
            <h1 className="text-3xl md:text-6xl font-semibold mb-5 md:mb-10">
                {t('privacy_policy')}
            </h1>
            <p className="md:text-2xl mb-5 md:mb-10">
                {t('privacy_policy_text.1')}
            </p>
            <p className="md:text-2xl mb-5 md:mb-10">
                <span className="block font-semibold">{t('privacy_policy_text.2')}</span>
                {t('privacy_policy_text.3')}
                <br />
                {t('privacy_policy_text.4')}
                <br />
                {t('privacy_policy_text.5')}
                <br />
                {t('privacy_policy_text.6')}
                <br />
                {t('privacy_policy_text.7')}
                <br />
                {t('privacy_policy_text.8')}
                <br />
                {t('privacy_policy_text.9')}
                <br />
                {t('privacy_policy_text.10')}

            </p>
            <p className="md:text-2xl mb-5 md:mb-10">
                <span className="block font-semibold">{t('privacy_policy_text.11')}</span>
                {t('privacy_policy_text.12')}
            </p>
            <p className="md:text-2xl mb-5 md:mb-10">
                <span className="block font-semibold">{t('privacy_policy_text.13')}</span>
                {t('privacy_policy_text.14')}
            </p>
            <p className="md:text-2xl mb-5 md:mb-10">
                <span className="block font-semibold">{t('privacy_policy_text.15')}</span>
                {t('privacy_policy_text.16')}
            </p>
            <p className="md:text-2xl mb-5 md:mb-10">
                <span className="block font-semibold">{t('privacy_policy_text.17')}</span>
                {t('privacy_policy_text.18')}
            </p>
            <p className="md:text-2xl mb-5 md:mb-10">
                {t('privacy_policy_text.19')}
                :
                {' '}
                <a href="mailto:moldovavote@yandex.ru">moldovavote@yandex.ru</a>
                .
                <br />
                <br />
                {t('privacy_policy_text.20')}
                : 14.07.2025
            </p>
        </section>
    );
}
