'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Product {
  id: number;
  title: string;
  price: string;
  videoUrl: string;
  seller: {
    username: string;
    avatarUrl: string;
  };
}

export default function Home() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const url = `${apiUrl}/api/products/public`;

    console.log('🔄 Начинаю загрузку продуктов...');
    console.log('📡 URL запроса:', url);

    // 🎯 РЕФЕРАЛЬНЫЕ ССЫЛКИ: Отслеживаем реф код сразу в начале
    const trackReferralOnce = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const referralCode = urlParams.get('rf');
        
        if (referralCode) {
          console.log('🔗 Отслеживаем реферальный код:', referralCode);
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost'}/api/referral-links/track?rf=${referralCode}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Реферальная ссылка отслежена:', result);
          } else {
            console.error('❌ Ошибка отслеживания реф ссылки:', response.status);
          }
        }
      } catch (error) {
        console.error('❌ Ошибка отслеживания реф ссылки:', error);
      }
    };

    fetch(url)
      .then((res) => {
        console.log('📥 Response status:', res.status);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        return res.json();
      })
      .then((data) => {
        console.log('📦 Получены данные:', data);
        console.log('📊 Количество продуктов:', data.length);

        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
        console.log('✅ Загрузка завершена успешно');

        // Отслеживаем реф ссылку только один раз
        trackReferralOnce();

        // 📊 АНАЛИТИКА: Отслеживаем посещение страницы
        const trackPageAnalytics = async () => {
          try {
            const pagePath = window.location.pathname;
            
            console.log('📊 Начинаем отслеживание страницы:', pagePath);
            
            const response = await fetch('/api/analytics/track-page', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                pagePath: pagePath,
                pageUrl: window.location.href
              })
            });

            console.log('📡 Ответ от API:', response.status);

            if (response.ok) {
              const result = await response.json();
              console.log('✅ Аналитика страницы отправлена:', result);
            } else {
              console.error('❌ Ошибка отправки аналитики страницы:', response.status);
            }
          } catch (error) {
            console.error('❌ Ошибка аналитики страницы:', error);
          }
        };

        trackPageAnalytics();

        // 🎯 АНАЛИТИКА: Отслеживаем посещение страницы
        const trackAnalytics = async () => {
          try {
            const analyticsData = {
              url: window.location.href,
              referrer: document.referrer,
              userAgent: navigator.userAgent,
              ref: null // Убираем реф код из общей аналитики
            };

            console.log('📊 Отправляем аналитику:', analyticsData);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/analytics/track`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(analyticsData)
            });

            if (response.ok) {
              console.log('✅ Аналитика отправлена успешно');
            } else {
              console.error('❌ Ошибка отправки аналитики:', response.status);
            }
          } catch (error) {
            console.error('❌ Ошибка аналитики:', error);
          }
        };

        trackAnalytics();
        trackPageView(); // Отслеживаем просмотр главной страницы
      })
      .catch((error) => {
        console.error('❌ Ошибка загрузки продуктов:', error);
        setLoading(false);
      });
  }, [t]);

  // Функция отслеживания просмотра страницы
  const trackPageView = async () => {
    try {
      const analyticsData = {
        pagePath: window.location.pathname,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        ref: null // Убираем реф код из аналитики страницы
      };

      console.log('📊 Отправляем аналитику страницы:', analyticsData);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/analytics/page-view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsData)
      });

      if (response.ok) {
        console.log('✅ Аналитика страницы отправлена успешно');
      } else {
        console.error('❌ Ошибка отправки аналитики страницы:', response.status);
      }
    } catch (error) {
      console.error('❌ Ошибка аналитики страницы:', error);
    }
  };

  // Функция отслеживания клика по продукту
  const trackProductClick = async (productId: number) => {
    try {
      const analyticsData = {
        productId: productId,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        ref: null // Убираем реф код из аналитики клика
      };

      console.log('📊 Отправляем аналитику клика по продукту:', analyticsData);

      const response = await fetch('http://localhost:3001/analytics/product-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsData)
      });

      if (response.ok) {
        console.log('✅ Аналитика клика по продукту отправлена успешно');
      } else {
        console.error('❌ Ошибка отправки аналитики клика:', response.status);
      }
    } catch (error) {
      console.error('❌ Ошибка аналитики клика:', error);
    }
  };

  // Фильтрация и сортировка
  useEffect(() => {
    let filtered = [...products];

    // Фильтр по цене
    if (minPrice || maxPrice) {
      filtered = filtered.filter(product => {
        const price = Number(product.price);
        const min = minPrice ? Number(minPrice) : 0;
        const max = maxPrice ? Number(maxPrice) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Сортировка
    filtered.sort((a, b) => {
      const priceA = Number(a.price);
      const priceB = Number(b.price);
      return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
    });

    setFilteredProducts(filtered);
  }, [products, minPrice, maxPrice, sortOrder]);

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const SortIcon = sortOrder === 'asc' ? ArrowUp : ArrowDown;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">{t('home.title')}</h1>

        {/* Фильтры и сортировка */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Фильтр цен */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder={t('filter.from')}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-24 rounded-md border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
            />
            <span className="text-muted-foreground">-</span>
            <input
              type="number"
              placeholder={t('filter.to')}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-24 rounded-md border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
            />
            <span className="text-sm text-muted-foreground">֏</span>
          </div>

          {/* Кнопка сортировки */}
          <button
            onClick={toggleSort}
            className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm hover:bg-accent transition-colors"
            title={`${t('filter.sort')}: ${sortOrder === 'asc' ? 'по возрастанию' : 'по убыванию'}`}
          >
            <SortIcon className="h-4 w-4" />
            <span>{t('filter.price')}</span>
          </button>
        </div>
      </div>

      {/* Информация о фильтрации */}
      {(minPrice || maxPrice) && (
        <div className="mb-4 text-sm text-muted-foreground">
          {t('filter.showing')} {filteredProducts.length} {t('filter.of')} {products.length} {t('filter.products')}
          {minPrice && ` ${t('filter.from')} ${Number(minPrice).toLocaleString()} ֏`}
          {maxPrice && ` ${t('filter.to')} ${Number(maxPrice).toLocaleString()} ֏`}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">{t('upload.loading')}</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group block overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
              onClick={() => trackProductClick(product.id)}
            >
              <div className="aspect-video w-full overflow-hidden bg-accent relative">
                {product.videoUrl ? (
                  <video
                    src={`${process.env.NEXT_PUBLIC_API_URL || ''}/api${product.videoUrl}`}
                    className="h-full w-full object-cover"
                    preload="metadata"
                    onMouseOver={(e) => e.currentTarget.play()}
                    onMouseOut={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                    muted
                    loop
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    {t('home.no_preview')}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="line-clamp-1 text-lg font-semibold group-hover:text-primary">
                  {product.title}
                </h3>
                <div className="text-sm text-muted-foreground mb-2">
                  N{product.id}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">
                    {Number(product.price).toLocaleString()} ֏
                  </span>

                  {product.seller && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-6 w-6 overflow-hidden rounded-full bg-accent">
                        {product.seller.avatarUrl && (
                          <img
                            src={product.seller.avatarUrl}
                            alt={product.seller.username}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <span className="truncate max-w-[80px]">
                        {product.seller.username}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg text-muted-foreground">
            {products.length === 0
              ? t('home.no_accounts')
              : t('filter.no_products')
            }
          </p>
          <Link href="/upload" className="mt-2 text-primary hover:underline block">
            {t('nav.upload')}!
          </Link>
        </div>
      )}
    </div>
  );
}
