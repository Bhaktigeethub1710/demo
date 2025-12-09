import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translation files
import en from './locales/en.json';
import hi from './locales/hi.json';
import bn from './locales/bn.json';
import te from './locales/te.json';
import mr from './locales/mr.json';
import ta from './locales/ta.json';
import gu from './locales/gu.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';
import or from './locales/or.json';
import pa from './locales/pa.json';
import as from './locales/as.json';
import ur from './locales/ur.json';
import sa from './locales/sa.json';
import kok from './locales/kok.json';
import ne from './locales/ne.json';
import mni from './locales/mni.json';
import ks from './locales/ks.json';
import sd from './locales/sd.json';
import doi from './locales/doi.json';
import mai from './locales/mai.json';
import sat from './locales/sat.json';
import brx from './locales/brx.json';

// All 22+ scheduled Indian languages + English
export const languages = [
    // Major Languages (Top 10 by speakers)
    { code: 'en', name: 'English', nativeName: 'English', region: 'International', dir: 'ltr' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', region: 'North', dir: 'ltr' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'East', dir: 'ltr' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'South', dir: 'ltr' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: 'West', dir: 'ltr' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'South', dir: 'ltr' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'West', dir: 'ltr' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'South', dir: 'ltr' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', region: 'South', dir: 'ltr' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'East', dir: 'ltr' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'North', dir: 'ltr' },

    // Other Scheduled Languages
    { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', region: 'Northeast', dir: 'ltr' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', region: 'North', dir: 'rtl' },
    { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', region: 'Classical', dir: 'ltr' },
    { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', region: 'West', dir: 'ltr' },
    { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', region: 'North', dir: 'ltr' },
    { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্', region: 'Northeast', dir: 'ltr' },
    { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر', region: 'North', dir: 'rtl' },
    { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', region: 'West', dir: 'rtl' },
    { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', region: 'North', dir: 'ltr' },
    { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', region: 'East', dir: 'ltr' },
    { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', region: 'East', dir: 'ltr' },
    { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', region: 'Northeast', dir: 'ltr' },
];

// Resources object for i18next
const resources = {
    en: { translation: en },
    hi: { translation: hi },
    bn: { translation: bn },
    te: { translation: te },
    mr: { translation: mr },
    ta: { translation: ta },
    gu: { translation: gu },
    kn: { translation: kn },
    ml: { translation: ml },
    or: { translation: or },
    pa: { translation: pa },
    as: { translation: as },
    ur: { translation: ur },
    sa: { translation: sa },
    kok: { translation: kok },
    ne: { translation: ne },
    mni: { translation: mni },
    ks: { translation: ks },
    sd: { translation: sd },
    doi: { translation: doi },
    mai: { translation: mai },
    sat: { translation: sat },
    brx: { translation: brx },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: false,

        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
            lookupLocalStorage: 'nyayasetu-language',
        },

        interpolation: {
            escapeValue: false, // React already escapes by default
        },

        react: {
            useSuspense: true,
        },
    });

// Helper function to get current language direction
export const getLanguageDir = (langCode) => {
    const lang = languages.find(l => l.code === langCode);
    return lang?.dir || 'ltr';
};

// Helper function to change language and update document direction
export const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    const dir = getLanguageDir(langCode);
    document.documentElement.dir = dir;
    document.documentElement.lang = langCode;
};

export default i18n;
