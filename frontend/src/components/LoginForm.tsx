'use client';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AuthApi } from '@/services';

export function LoginForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<'div'>) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await AuthApi.login(formData);
            router.push('/dashboard');
        } catch (error) {
            if (isAxiosError(error)) {
                if (error.status === 403) {
                    setError('Incorrect username or password, please try again.');
                }
            } else {
                setError('Unknown error');
            }
        }
    };
    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Логин</CardTitle>
                    <CardDescription>
                        Введите email
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="m@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Авторизоваться
                            </Button>
                        </div>
                        {error
                            ? (
                                    <div className="mt-4 text-center text-sm">{error}</div>
                                )
                            : null}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
