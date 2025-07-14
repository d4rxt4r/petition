import { z } from 'zod/v4';

export const VoteFormSchema = z.object({
    fullName: z.string().min(1).max(255),
    phone: z.e164({
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
    captcha: z.string().nonempty({
        message: 'Пожалуйста, пройдите проверку',
    }),
});

export type VoteFormData = z.infer<typeof VoteFormSchema>;
