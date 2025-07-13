import { z } from 'zod/v4';

export const VoteFormSchema = z.object({
    fullName: z.string().min(1).max(255),
    phone: z.e164({
        error: 'Некорректный номер телефона',
    }),
    agreement: z.literal(true),
    email: z.string({
        error: 'Некорректный email',
    }).max(0).or(z.string({
        error: 'Некорректный email',
    }).email({
        error: 'Некорректный email',
    })),
});

export type VoteFormData = z.infer<typeof VoteFormSchema>;
