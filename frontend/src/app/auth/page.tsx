import React from 'react';
import { LoginForm } from '@/components/LoginForm';

const LoginPage: React.FC = () => {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <LoginForm />
            </div>
        </div>
    );
};

export default LoginPage;
