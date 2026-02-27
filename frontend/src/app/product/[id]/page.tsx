'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext'; // Import context

interface Product {
    id: number;
    title: string;
    description: string;
    price: string;
    videoUrl: string;
    seller: {
        username: string;
        avatarUrl: string;
    };
}

export default function ProductDetail() {
    const { t, language } = useLanguage(); // Use hook
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Отслеживаем просмотр страницы продукта
        const trackProductPageView = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const referralCode = urlParams.get('ref') || urlParams.get('referral');

                const analyticsData = {
                    pagePath: window.location.pathname,
                    url: window.location.href,
                    referrer: document.referrer,
                    userAgent: navigator.userAgent,
                    ref: referralCode
                };

                console.log('📊 Отправляем аналитику страницы продукта:', analyticsData);

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/analytics/page-view`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(analyticsData)
                });

                if (response.ok) {
                    console.log('✅ Аналитика страницы продукта отправлена успешно');
                } else {
                    console.error('❌ Ошибка отправки аналитики страницы продукта:', response.status);
                }
            } catch (error) {
                console.error('❌ Ошибка аналитики страницы продукта:', error);
            }
        };

        if (params.id) {
            console.log('🔄 Загрузка детальной информации о продукте...');
            console.log('📡 URL запроса:', `/api/products/${params.id}`);

            fetch(`/api/products/${params.id}`)
                .then((res) => {
                    console.log('📥 Response status:', res.status);
                    return res.json();
                })
                .then((data) => {
                    console.log('📦 Получены данные о продукте:', data);
                    setProduct(data);
                    trackProductPageView(); // Отслеживаем просмотр после загрузки
                })
                .then(() => setLoading(false))
                .catch((err) => {
                    console.error('❌ Ошибка загрузки продукта:', err);
                    setLoading(false);
                });
        }
    }, [params.id]);

    if (loading) return <div className="py-20 text-center">{t('upload.loading')}</div>;
    if (!product) return <div className="py-20 text-center">Product not found</div>;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    return (
        <div className="container mx-auto max-w-4xl py-8 px-4">
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Content (Video & Title) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="overflow-hidden rounded-xl border border-border bg-black shadow-lg">
                        {product.videoUrl ? (
                            <video
                                src={`${process.env.NEXT_PUBLIC_API_URL || ''}/api${product.videoUrl}`}
                                className="w-full aspect-video"
                                controls
                                preload="metadata"
                            />
                        ) : (
                            <div className="flex aspect-video items-center justify-center bg-accent text-muted-foreground">
                                No Video Available
                            </div>
                        )}
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold">{product.title}</h1>
                        <div className="text-sm text-muted-foreground mb-4">
                          N{product.id}
                        </div>
                        <div className="mt-4 prose prose-invert max-w-none text-muted-foreground">
                            <h3 className="text-foreground font-semibold mb-2">{t('upload.label.desc')}</h3>
                            <p className="whitespace-pre-wrap">{product.description}</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar (Price & Seller) */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
                        <div className="mb-4 text-3xl font-bold text-primary">
                            {Number(product.price).toLocaleString()} ֏
                        </div>

                        <a
                            href="https://t.me/Fast_Elit"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full rounded-lg bg-primary py-3 font-bold text-primary-foreground hover:bg-primary/90 transition-colors text-center block"
                        >
                            {language === 'hy' ? 'Գնել հիմա' :
                                language === 'ru' ? 'Купить сейчас' :
                                    'Buy Now'}
                        </a>
                        <p className="mt-3 text-xs text-center text-muted-foreground">
                            {t('product.secure')}
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="mb-4 font-semibold text-foreground">{t('product.seller')}</h3>
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-full bg-accent">
                                {product.seller?.avatarUrl && (
                                    <img
                                        src={product.seller.avatarUrl}
                                        alt={product.seller.username}
                                        className="h-full w-full object-cover"
                                    />
                                )}
                            </div>
                            <div>
                                <div className="font-medium text-foreground">
                                    {product.seller?.username || 'Unknown Seller'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {t('product.verified')}
                                </div>
                            </div>
                        </div>

                        <Link
                            href={`https://t.me/${product.seller?.username}`}
                            target="_blank"
                            className="mt-4 block w-full rounded-lg border border-border py-2 text-center text-sm font-medium hover:bg-accent transition-colors"
                        >
                            {t('product.contact')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
