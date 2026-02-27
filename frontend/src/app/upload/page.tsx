'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { MessageCircle } from 'lucide-react';

export default function UploadPage() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const [file, setFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return alert('Please select a video');
        setUploading(true);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        try {
            const token = localStorage.getItem('token');

            // 1. Upload Video
            const fileData = new FormData();
            fileData.append('file', file);

            const uploadRes = await fetch(`${apiUrl}/files/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: fileData,
            });

            if (!uploadRes.ok) throw new Error('Video upload failed');
            const { url: videoUrl } = await uploadRes.json();

            // 2. Create Product
            const productRes = await fetch(`${apiUrl}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    videoUrl,
                }),
            });

            if (!productRes.ok) throw new Error('Product creation failed');

            router.push('/');
        } catch (error) {
            console.error(error);
            alert('Error creating listing');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl py-10">
            <h1 className="mb-8 text-3xl font-bold">{t('upload.title')}</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium">{t('upload.label.title')}</label>
                    <input
                        type="text"
                        required
                        className="w-full rounded-md border bg-background px-3 py-2"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">{t('upload.label.desc')}</label>
                    <textarea
                        required
                        className="w-full rounded-md border bg-background px-3 py-2"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">{t('upload.label.price')}</label>
                    <input
                        type="number"
                        required
                        className="w-full rounded-md border bg-background px-3 py-2"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">{t('upload.label.video')}</label>
                    <input
                        type="file"
                        accept="video/*"
                        required
                        onChange={handleFileChange}
                        className="w-full"
                    />
                </div>

                <a 
                    href="https://t.me/Fast_Elit" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full rounded-lg bg-primary py-3 font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    {language === 'hy' ? 'Գնել հիմա' : 
                     language === 'ru' ? 'Купить сейчас' : 
                     'Buy Now'}
                </a>
            </form>

            {/* Telegram CTA Section */}
            <div className="mt-12 rounded-lg border border-border bg-card p-6 text-center">
                <h2 className="mb-4 text-xl font-semibold">
                    {language === 'hy' ? 'Ունկանալ համակարգի հետ' : 
                     language === 'ru' ? 'Связаться с нами' : 
                     'Contact Us'}
                </h2>
                <p className="mb-6 text-muted-foreground">
                    {language === 'hy' ? 'Հետևմ հարցեք մեր գնել հաշիվում և ստացում լավագույն ակկաունտների մասին' : 
                     language === 'ru' ? 'Посетите наш Telegram канал для покупки и продажи игровых аккаунтов' : 
                     'Visit our Telegram channel to buy and sell game accounts'}
                </p>
                <a 
                    href="https://t.me/Fast_Elit" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-600 transition-colors"
                >
                    <MessageCircle className="h-5 w-5" />
                    {language === 'hy' ? 'Գնել հաշիվ' : 
                     language === 'ru' ? 'Перейти в Telegram' : 
                     'Open Telegram'}
                </a>
            </div>
        </div>
    );
}
