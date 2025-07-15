'use client';

import type { SMSFormData, VoteFormData } from '@/schema';
import { SmartCaptcha } from '@yandex/smart-captcha';
import { HelpCircle, Mail } from 'lucide-react';
import { env } from 'next-runtime-env';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { customResolver } from '@/lib/zodResolver';
import { SMSFormSchema, VoteFormSchema } from '@/schema';
import { Button } from './ui/button';

import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { PhoneInput } from './ui/phone-input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import '@/i18n';

const defaultValues = {
    fullName: '',
    phone: '',
    email: '',
    captcha: '',
};

export function VoteForm() {
    const router = useRouter();
    const { t, i18n } = useTranslation();

    const NEXT_PUBLIC_YCAPTCHA_CLIENT_KEY = env(
        'NEXT_PUBLIC_YCAPTCHA_CLIENT_KEY',
    );
    const NEXT_PUBLIC_ENV = env('NEXT_PUBLIC_ENV');

    const form = useForm<VoteFormData>({
        resolver: customResolver(VoteFormSchema),
        defaultValues,
    });

    const smsForm = useForm<SMSFormData>({
        resolver: customResolver(SMSFormSchema),
    });

    const [resetCaptcha, setResetCaptcha] = useState(0);
    const handleCaptchaReset = () => setResetCaptcha((prev) => prev + 1);

    const [confirmedPhone, setConfirmedPhone] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(true);

    const onSubmit = async (values: VoteFormData) => {
        const apiPath
            = NEXT_PUBLIC_ENV === 'dev'
                ? 'http://localhost/api/vote/validate'
                : '/api/vote/validate';
        const { full_name, email, phone_number, token } = values;

        try {
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
                setConfirmedPhone(phone_number);
                setShowConfirmation(true);
            } else {
                const data = await res.json();
                if (data?.status === 'already_verified') {
                    form.setError('phone_number', {
                        type: 'custom',
                        message: t('phone_error'),
                    });
                } else {
                    form.setError('agreement', {
                        type: 'custom',
                        message: t('vote_error'),
                    });
                }
                handleCaptchaReset();
            }
        } catch (error) {
            console.error(error);
            handleCaptchaReset();
        }
    };

    const onSubmitSMS = async (values: SMSFormData) => {
        const apiPath
            = NEXT_PUBLIC_ENV === 'dev'
                ? 'http://localhost/api/vote/verify_sms'
                : '/api/vote/verify_sms';
        const { code } = values;

        const res = await fetch(apiPath, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phone: confirmedPhone,
                code,
            }),
        });

        if (res.status === 200) {
            router.push('/main/thank-you');
        } else {
            smsForm.setError('code', { type: 'custom', message: t('sms_error') });
        }
    };

    if (showConfirmation) {
        return (
            <Form {...smsForm} key="sms-form">
                <form
                    onSubmit={smsForm.handleSubmit(onSubmitSMS)}
                    className="flex flex-col flex-1 md:min-h-[714px] bg-[#F2F2F2] rounded-2xl px-6 md:px-8 py-8 overflow-hidden"
                >
                    <div className="text-3xl md:text-5xl font-semibold mb-10">
                        {t('sms_header')}
                    </div>
                    <div className="flex flex-col gap-4 mb-10">
                        <FormField
                            control={smsForm.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="relative">

                                            <input
                                                {...field}
                                                className="bg-white p-6 rounded-2xl text-lg w-full"
                                                placeholder={t('sms_placeholder')}
                                                type="text"
                                                required
                                            />
                                            <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
                                                <TooltipProvider>
                                                    <Popover>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 w-6 p-0 rounded-full hover:bg-gray-200"
                                                                        type="button"
                                                                    >
                                                                        <HelpCircle className="h-4 w-4 text-gray-500" />
                                                                    </Button>
                                                                </PopoverTrigger>
                                                            </TooltipTrigger>

                                                            <TooltipContent>
                                                                <p>{t('code_help_title')}</p>
                                                            </TooltipContent>
                                                        </Tooltip>

                                                        <PopoverContent className="w-80 p-6" align="center">
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-2">
                                                                    <Mail className="h-5 w-5 text-blue-600" />
                                                                    <h3 className="font-semibold text-gray-900">{t('code_help_header')}</h3>
                                                                </div>

                                                                <div className="space-y-3 text-sm text-gray-700">
                                                                    <p>{t('code_help_text.1')}</p>

                                                                    <p>{t('code_help_text.2')}</p>

                                                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                                                        <p className="font-medium text-blue-800 text-center">moldovavote@mail.ru</p>
                                                                    </div>

                                                                    <p className="text-xs text-gray-600">
                                                                        {t('code_help_text.3')}
                                                                    </p>
                                                                </div>

                                                                <Button
                                                                    className="w-full rounded-lg text-white font-semibold bg-linear-to-t from-[#1A2B87] to-[#4155C7] py-4 md:py-6"
                                                                    onClick={() => window.open('mailto:moldovavote@mail.ru', '_blank')}
                                                                    type="button"
                                                                >
                                                                    <Mail className="h-4 w-4 mr-2" />
                                                                    {t('code_help_btn')}
                                                                </Button>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </TooltipProvider>
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <button
                        type="submit"
                        className="mt-auto cursor-pointer rounded-2xl text-white font-semibold bg-linear-to-t from-[#1A2B87] to-[#4155C7] py-4 md:py-6"
                    >
                        {t('sign_petition')}
                    </button>
                </form>
            </Form>
        );
    }

    return (
        <Form {...form} key="form">
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col flex-1 bg-[#F2F2F2] rounded-2xl px-6 md:px-8 py-8 overflow-hidden"
            >
                <div className="text-3xl md:text-5xl font-semibold mb-10">
                    {t('vote_header')}
                </div>
                <div className="flex flex-col gap-4 mb-10">
                    <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <input
                                        {...field}
                                        className="bg-white p-6 rounded-2xl text-lg w-full"
                                        placeholder={t('fullName_placeholder')}
                                        type="text"
                                        required
                                    />
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
                                    <PhoneInput
                                        {...field}
                                        placeholder={t('phone_placeholder')}
                                        countries={['RU', 'MD']}
                                        defaultCountry="RU"
                                        international
                                        className="w-full"
                                    />
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
                                    <input
                                        {...field}
                                        className="bg-white p-6 rounded-2xl text-lg w-full"
                                        placeholder={t('email_placeholder')}
                                        type="email"
                                    />
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
                                        key={resetCaptcha}
                                        language={i18n.language === 'ru' ? 'ru' : 'en'}
                                        sitekey={NEXT_PUBLIC_YCAPTCHA_CLIENT_KEY as string}
                                        onSuccess={(token) => {
                                            field.onChange(token);
                                        }}
                                        onTokenExpired={() => {
                                            field.onChange('');
                                            handleCaptchaReset();
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
                        <FormItem className="mb-10 w-full">
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
                                    <Link href="/main/privacy-policy" className="underline">
                                        {t('agreement_link')}
                                    </Link>
                                </span>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <button
                    type="submit"
                    className="mt-auto cursor-pointer rounded-2xl text-white font-semibold bg-linear-to-t from-[#1A2B87] to-[#4155C7] py-4 md:py-6"
                >
                    {t('sign_petition')}
                </button>
            </form>
        </Form>
    );
}
