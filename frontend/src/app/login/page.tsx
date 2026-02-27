'use client';

import TelegramLogin from '@/components/TelegramLogin';
import { useLanguage } from '@/context/LanguageContext';

export default function LoginPage() {
    const { t } = useLanguage();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl border border-border bg-card p-8 shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        {t('login.title')}
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        {t('login.subtitle')}
                    </p>
                </div>

                <div className="flex justify-center py-8">
                    <TelegramLogin />
                </div>
            </div>
        </div>
    );
}
