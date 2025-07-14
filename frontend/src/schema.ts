import { z } from 'zod/v4';

export const VoteFormSchema = z.object({
    full_name: z.string().min(1).max(255),
    phone_number: z.e164({
        error: 'Некорректный номер телефона',
    }),
    agreement: z.literal(true, {
        error: 'Пожалуйста, согласитесь с условиями',
    }),
    email: z.string({
        error: 'Некорректный email',
    }).max(0).or(z.string({
        error: 'Некорректный email',
    }).email({
        error: 'Некорректный email',
    })),
    token: z.string().nonempty({
        message: 'Пожалуйста, пройдите проверку',
    }),
});

export type VoteFormData = z.infer<typeof VoteFormSchema>;

export const SMSFormSchema = z.object({
    code: z.string().min(6).max(6),
});

export type SMSFormData = z.infer<typeof SMSFormSchema>;
