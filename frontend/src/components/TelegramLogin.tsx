'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface TelegramUser {
    id: number;
    first_name: string;
    username: string;
    photo_url: string;
    auth_date: number;
    hash: string;
}

export default function TelegramLogin() {
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        // Define the callback function globally
        (window as any).onTelegramAuth = async (user: TelegramUser) => {
            console.log('Telegram user:', user);

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                const response = await fetch(`${apiUrl}/auth/telegram`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(user),
                });

                if (response.ok) {
                    const data = await response.json();
                    // Store token
                    localStorage.setItem('token', data.access_token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    router.push('/');
                } else {
                    console.error('Login failed');
                    alert('Login failed');
                }
            } catch (error) {
                console.error('Login error', error);
            }
        };

        // Inject script
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.setAttribute('data-telegram-login', 'FastElit_Bot');
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-radius', '10');
        script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        script.setAttribute('data-request-access', 'write');
        script.async = true;

        if (containerRef.current) {
            containerRef.current.innerHTML = '';
            containerRef.current.appendChild(script);
        }
    }, [router]);

    return <div ref={containerRef} className="flex justify-center" />;
}
