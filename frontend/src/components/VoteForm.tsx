import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function VoteForm() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col flex-1 bg-[#F2F2F2] rounded-2xl px-6 md:px-8 py-7 md:py-[80]">
            <div className="text-3xl md:text-5xl font-semibold mb-12">
                {t('vote_header')}
            </div>
            <div className="flex flex-col gap-4 mb-10">
                <input id="fullName" className="bg-white p-6 rounded-2xl text-lg" placeholder={t('fullName_placeholder')} type="text" required />
                <input id="phone" type="tel" className="bg-white p-6 rounded-2xl text-lg" placeholder={t('phone_placeholder')} required />
                <input id="email" type="email" className="bg-white p-6 rounded-2xl text-lg" placeholder={t('email_placeholder')} />
            </div>
            <div className="mb-10 flex gap-2 items-center">
                <input id="agreement" type="checkbox" value="" required className="appearance-none checked:appearance-auto w-8 h-8 shrink-0 bg-white border-none rounded-sm" />
                <span>
                    {t('agreement_text')}
                    <Link href="/main/privacy-policy" className="underline">{t('agreement_link')}</Link>
                </span>
            </div>
            <button type="submit" className="mt-auto rounded-2xl text-white font-semibold bg-linear-to-t from-[#1A2B87] to-[#4155C7] py-4 md:py-6">
                {t('sign_petition')}
            </button>
        </div>
    );
}
