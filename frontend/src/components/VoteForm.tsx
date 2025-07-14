import type { SMSFormData, VoteFormData } from '@/schema';
import { SmartCaptcha } from '@yandex/smart-captcha';
import { env } from 'next-runtime-env';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { customResolver } from '@/lib/zodResolver';
import { SMSFormSchema, VoteFormSchema } from '@/schema';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { PhoneInput } from './ui/phone-input';

const defaultValues = {
    fullName: '',
    phone: '',
    email: '',
    captcha: '',
};

export function VoteForm() {
    const { t, i18n } = useTranslation();

    const NEXT_PUBLIC_YCAPTCHA_CLIENT_KEY = env('NEXT_PUBLIC_YCAPTCHA_CLIENT_KEY');
    const NEXT_PUBLIC_ENV = env('NEXT_PUBLIC_ENV');

    const form = useForm<VoteFormData>({
        resolver: customResolver(VoteFormSchema),
        defaultValues,
    });

    const smsForm = useForm<SMSFormData>({
        resolver: customResolver(SMSFormSchema),
    });

    const [confirmedPhone, setConfirmedPhone] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);

    const onSubmit = async (values: VoteFormData) => {
        const apiPath = NEXT_PUBLIC_ENV === 'dev' ? 'http://localhost/api/vote/validate' : '/api/vote/validate';
        const { full_name, email, phone_number, token } = values;

        const res = await fetch(apiPath, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                full_name,
                email,
                phone_number,
                token,
            }),
        });

        if (res.status === 200) {
            // todo
            setConfirmedPhone(phone_number);
            setShowConfirmation(true);
        }
    };

    if (showConfirmation) {
        return (
            <Form {...smsForm}>
                <form className="flex flex-col flex-1 bg-[#F2F2F2] rounded-2xl px-6 md:px-8 py-7 md:py-[80]">
                    <div className="flex flex-col gap-4 mb-10">
                        <FormField
                            control={smsForm.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <input {...field} className="bg-white p-6 rounded-2xl text-lg" placeholder={t('sms_placeholder')} type="text" required />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </form>
            </Form>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 bg-[#F2F2F2] rounded-2xl px-6 md:px-8 py-7 md:py-[80]">
                <div className="text-3xl md:text-5xl font-semibold mb-12">
                    {t('vote_header')}
                </div>
                <div className="flex flex-col gap-4 mb-10">
                    <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <input {...field} className="bg-white p-6 rounded-2xl text-lg" placeholder={t('fullName_placeholder')} type="text" required />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    {/* <input {...field} className="bg-white p-6 rounded-2xl text-lg" placeholder={t('phone_placeholder')} type="tel" required /> */}
                                    <PhoneInput {...field} placeholder={t('phone_placeholder')} countries={['RU', 'MD']} defaultCountry="RU" international />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <input {...field} className="bg-white p-6 rounded-2xl text-lg" placeholder={t('email_placeholder')} type="email" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="token"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <SmartCaptcha
                                        {...field}
                                        language={i18n.language === 'ru' ? 'ru' : 'en'}
                                        sitekey={NEXT_PUBLIC_YCAPTCHA_CLIENT_KEY as string}
                                        onSuccess={(token) => {
                                            field.onChange(token);
                                        }}
                                        onTokenExpired={() => {
                                            field.onChange('');
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="agreement"
                    render={({ field }) => (
                        <FormItem className="mb-10">
                            <div className="flex gap-2 items-center">
                                <FormControl>
                                    <input
                                        {...field}
                                        className="appearance-none checked:appearance-auto w-8 h-8 shrink-0 bg-white border-none rounded-sm"
                                        value={field.value ? 'yes' : ''}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            field.onChange(checked);
                                        }}
                                        type="checkbox"
                                        required
                                    />
                                </FormControl>
                                <span>
                                    {t('agreement_text')}
                                    {' '}
                                    <Link href="/main/privacy-policy" className="underline">{t('agreement_link')}</Link>
                                </span>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <button type="submit" className="mt-auto cursor-pointer rounded-2xl text-white font-semibold bg-linear-to-t from-[#1A2B87] to-[#4155C7] py-4 md:py-6">
                    {t('sign_petition')}
                </button>
            </form>
        </Form>
    );
}
