'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ru' | 'hy' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations = {
    ru: {
        'nav.browse': 'Просмотр',
        'nav.upload': 'Продать аккаунт',
        'nav.login': 'Войти',
        'home.title': 'Последние аккаунты',
        'home.search': 'Поиск игровых аккаунтов...',
        'home.no_accounts': 'Аккаунтов пока нет. Будьте первыми!',
        'home.no_preview': 'Нет превью',
        'filter.price': 'Цена',
        'filter.from': 'От',
        'filter.to': 'До',
        'filter.sort': 'Сортировка',
        'filter.showing': 'Показано',
        'filter.of': 'из',
        'filter.products': 'продуктов',
        'filter.no_products': 'Продукты не найдены. Попробуйте изменить фильтры.',
        'product.buy': 'Купить сейчас',
        'product.secure': 'Безопасная сделка через Telegram',
        'product.seller': 'Продавец',
        'product.contact': 'Связаться с продавцом',
        'product.verified': 'Проверенный пользователь',
        'upload.title': 'Новое объявление',
        'upload.label.title': 'Название',
        'upload.label.desc': 'Описание',
        'upload.label.price': 'Цена (֏)',
        'upload.label.video': 'Видео (макс. 100МБ)',
        'upload.submit': 'Создать объявление',
        'upload.loading': 'Загрузка...',
        'login.title': 'FastElit',
        'login.subtitle': 'Войдите через Telegram для продолжения',
    },
    hy: {
        'nav.browse': 'Դիտել',
        'nav.upload': 'Վաճառել հաշիվը',
        'nav.login': 'Մուտք',
        'home.title': 'Վերջին հաշիվները',
        'home.search': 'Փնտրել խաղային հաշիվներ...',
        'home.no_accounts': 'Հաշիվներ դեռ չկան: Եղեք առաջինը!',
        'home.no_preview': 'Նախադիտում չկա',
        'filter.price': 'Գին',
        'filter.from': 'Սկսած',
        'filter.to': 'Մինչև',
        'filter.sort': 'Դասավորում',
        'filter.showing': 'Ցուցադրվում է',
        'filter.of': 'ից',
        'filter.products': 'ապրանքներ',
        'filter.no_products': 'Ապրանքներ չեն գտնվել: Փորձեք փոխել ֆիլտրերը:',
        'product.buy': 'Գնել հիմա',
        'product.secure': 'Անվտանգ գործարք Telegram-ի միջոցով',
        'product.seller': 'Վաճառող',
        'product.contact': 'Կապվել վաճառողի հետ',
        'product.verified': 'Ստուգված օգտատեր',
        'upload.title': 'Նոր հայտարարություն',
        'upload.label.title': 'Անվանում',
        'upload.label.desc': 'Նկարագրություն',
        'upload.label.price': 'Գին (֏)',
        'upload.label.video': 'Տեսանյութ (առավելագույնը 100ՄԲ)',
        'upload.submit': 'Ստեղծել հայտարարություն',
        'upload.loading': 'Բեռնում...',
        'login.title': 'FastElit',
        'login.subtitle': 'Մուտք գործեք Telegram-ի միջոցով շարունակելու համար',
    },
    en: {
        'nav.browse': 'Browse',
        'nav.upload': 'Sell Account',
        'nav.login': 'Login',
        'home.title': 'Latest Accounts',
        'home.search': 'Search game accounts...',
        'home.no_accounts': 'No accounts yet. Be the first!',
        'home.no_preview': 'No Preview',
        'filter.price': 'Price',
        'filter.from': 'From',
        'filter.to': 'To',
        'filter.sort': 'Sort',
        'filter.showing': 'Showing',
        'filter.of': 'of',
        'filter.products': 'products',
        'filter.no_products': 'No products found. Try changing the filters.',
        'product.buy': 'Buy Now',
        'product.secure': 'Secure transaction via Telegram',
        'product.seller': 'Seller',
        'product.contact': 'Contact Seller',
        'product.verified': 'Verified User',
        'upload.title': 'New Listing',
        'upload.label.title': 'Title',
        'upload.label.desc': 'Description',
        'upload.label.price': 'Price (֏)',
        'upload.label.video': 'Video (max 100MB)',
        'upload.submit': 'Create Listing',
        'upload.loading': 'Uploading...',
        'login.title': 'FastElit',
        'login.subtitle': 'Login with Telegram to continue',
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('hy');

    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang) {
            setLanguage(savedLang);
            // eslint-disable-next-line
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string) => {
        return translations[language][key as keyof typeof translations['ru']] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
