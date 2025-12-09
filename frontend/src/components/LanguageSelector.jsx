import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown, Search } from 'lucide-react';
import { languages, changeLanguage } from '@/i18n';
import { Button } from '@/components/ui/button';

// Group languages by region
const groupedLanguages = {
    'International': languages.filter(l => l.region === 'International'),
    'North India': languages.filter(l => l.region === 'North'),
    'South India': languages.filter(l => l.region === 'South'),
    'East India': languages.filter(l => l.region === 'East'),
    'West India': languages.filter(l => l.region === 'West'),
    'Northeast India': languages.filter(l => l.region === 'Northeast'),
    'Classical': languages.filter(l => l.region === 'Classical'),
};

const LanguageSelector = ({ variant = 'icon' }) => {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleLanguageChange = (langCode) => {
        changeLanguage(langCode);
        setIsOpen(false);
        setSearchTerm('');
    };

    // Filter languages based on search term
    const filterLanguages = (langs) => {
        if (!searchTerm) return langs;
        const term = searchTerm.toLowerCase();
        return langs.filter(l =>
            l.name.toLowerCase().includes(term) ||
            l.nativeName.toLowerCase().includes(term)
        );
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            {variant === 'icon' ? (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                    className="hidden md:flex"
                    aria-label={t('common.selectLanguage')}
                >
                    <Globe className="h-5 w-5" />
                </Button>
            ) : (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                    <Globe className="h-4 w-4" />
                    <span>{currentLang.nativeName}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            )}

            {/* Dropdown */}
            {isOpen && (
                <div
                    className="absolute right-0 top-full mt-2 w-72 max-h-96 overflow-hidden bg-white border border-gray-200 rounded-xl shadow-xl z-50"
                    style={{ direction: 'ltr' }}
                >
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search language..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm bg-transparent border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Language List */}
                    <div className="overflow-y-auto max-h-72">
                        {Object.entries(groupedLanguages).map(([region, langs]) => {
                            const filteredLangs = filterLanguages(langs);
                            if (filteredLangs.length === 0) return null;

                            return (
                                <div key={region}>
                                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
                                        {region}
                                    </div>
                                    {filteredLangs.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => handleLanguageChange(lang.code)}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-primary/5 transition-colors ${i18n.language === lang.code ? 'bg-primary/10 text-primary' : 'text-gray-700'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium">{lang.nativeName}</span>
                                                <span className="text-xs text-gray-400">({lang.name})</span>
                                            </div>
                                            {i18n.language === lang.code && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer with count */}
                    <div className="px-3 py-2 text-xs text-center text-gray-400 border-t border-gray-100 bg-gray-50">
                        {languages.length} languages supported
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
