'use client';

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import translationRo from '@/locales/ro.json';
import translationRu from '@/locales/ru.json';

const resources = {
    ru: {
        translation: translationRu,
    },
    ro: {
        translation: translationRo,
    },
};

i18n.use(LanguageDetector).use(initReactI18next).init({
    resources,
    // lng: 'ru',
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'ro'],
    detection: {
        order: ['cookie'],
        lookupCookie: 'i18next',
        caches: ['cookie'],
    },
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
