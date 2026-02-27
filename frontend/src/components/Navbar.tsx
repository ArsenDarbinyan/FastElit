'use client';

import Link from 'next/link';
import { User, Globe, MessageCircle, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
    const { language, setLanguage, t } = useLanguage();
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsLangDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="border-b bg-card sticky top-0 z-50">
            <div className="container mx-auto flex h-16 items-center justify-between px-2 sm:px-4">
                <Link href="/" className="text-xl sm:text-2xl font-bold text-primary">
                    FastElit
                </Link>

                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Mobile: Hide upload link, Desktop: Show */}
                    <Link 
                        href="/upload" 
                        className="hidden sm:block hover:text-primary text-sm sm:text-base"
                    >
                        {t('nav.upload')}
                    </Link>

                    {/* Language Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                            className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-sm hover:bg-accent transition-colors"
                        >
                            <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                            <span className="font-medium">{language.toUpperCase()}</span>
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                        </button>
                        
                        {isLangDropdownOpen && (
                            <div className="absolute right-0 top-full mt-1 rounded-md border border-border bg-background shadow-lg z-50 min-w-[100px]">
                                <button
                                    onClick={() => {
                                        setLanguage('hy');
                                        setIsLangDropdownOpen(false);
                                    }}
                                    className={`block w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors ${
                                        language === 'hy' ? 'text-yellow-500 font-semibold' : 'text-muted-foreground'
                                    }`}
                                >
                                    HY
                                </button>
                                <button
                                    onClick={() => {
                                        setLanguage('ru');
                                        setIsLangDropdownOpen(false);
                                    }}
                                    className={`block w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors ${
                                        language === 'ru' ? 'text-yellow-500 font-semibold' : 'text-muted-foreground'
                                    }`}
                                >
                                    RU
                                </button>
                                <button
                                    onClick={() => {
                                        setLanguage('en');
                                        setIsLangDropdownOpen(false);
                                    }}
                                    className={`block w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors ${
                                        language === 'en' ? 'text-yellow-500 font-semibold' : 'text-muted-foreground'
                                    }`}
                                >
                                    EN
                                </button>
                            </div>
                        )}
                    </div>

                    {/* User Icon */}
                    <Link 
                        href="/login" 
                        className="rounded-full bg-accent p-1.5 sm:p-2 hover:bg-accent/80 transition-colors"
                    >
                        <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Link>
                </div>
            </div>
        </nav>
    );
}
