// Nyaya Setu FAQ Data - Language Aware Version
// This file provides functions to get FAQs and find answers based on current language

import i18n from '@/i18n';

// Function to get FAQs from locale files
const getFaqData = () => {
    const faq = i18n.t('chatbot.faq', { returnObjects: true });
    if (typeof faq === 'object' && faq !== null) {
        return Object.keys(faq).map(key => ({
            id: parseInt(key),
            question: faq[key].question,
            answer: faq[key].answer,
            keywords: faq[key].keywords || []
        }));
    }
    return [];
};

// Function to get fallback message in current language
const getFallbackMessage = () => {
    return i18n.t('chatbot.fallback');
};

// Function to get quick actions in current language
export const getQuickActions = () => {
    const quickActions = i18n.t('chatbot.quickActions', { returnObjects: true });
    if (typeof quickActions === 'object' && quickActions !== null) {
        return Object.values(quickActions);
    }
    return [
        "What is Nyaya Setu?",
        "How to track application?",
        "Payment issues",
        "Data safety"
    ];
};

// Detect script type from text
const detectScript = (text) => {
    // Devanagari (Hindi, Marathi, Sanskrit, etc.)
    if (/[\u0900-\u097F]/.test(text)) return 'devanagari';
    // Bengali
    if (/[\u0980-\u09FF]/.test(text)) return 'bengali';
    // Tamil
    if (/[\u0B80-\u0BFF]/.test(text)) return 'tamil';
    // Telugu
    if (/[\u0C00-\u0C7F]/.test(text)) return 'telugu';
    // Kannada
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kannada';
    // Malayalam
    if (/[\u0D00-\u0D7F]/.test(text)) return 'malayalam';
    // Gujarati
    if (/[\u0A80-\u0AFF]/.test(text)) return 'gujarati';
    // Punjabi (Gurmukhi)
    if (/[\u0A00-\u0A7F]/.test(text)) return 'punjabi';
    // Odia
    if (/[\u0B00-\u0B7F]/.test(text)) return 'odia';
    // Default to Latin (English)
    return 'latin';
};

// Function to find the best matching FAQ answer
export const findBestAnswer = (userMessage) => {
    const input = userMessage.toLowerCase().trim();
    const faqData = getFaqData();
    const fallbackMessage = getFallbackMessage();

    // Skip very short inputs
    if (input.length < 2) {
        return fallbackMessage;
    }

    // If no FAQ data available, return fallback
    if (!faqData || faqData.length === 0) {
        return fallbackMessage;
    }

    let bestMatch = null;
    let highestScore = 0;

    faqData.forEach(faq => {
        let score = 0;

        // Check keyword matches (higher weight)
        if (faq.keywords && Array.isArray(faq.keywords)) {
            faq.keywords.forEach(keyword => {
                if (input.includes(keyword.toLowerCase())) {
                    score += 3;
                }
            });
        }

        // Check if input words appear in the question (medium weight)
        const inputWords = input.split(/\s+/).filter(word => word.length > 2);
        const questionLower = faq.question.toLowerCase();

        inputWords.forEach(word => {
            if (questionLower.includes(word)) {
                score += 2;
            }
        });

        // Check if question words appear in input (lower weight)
        const questionWords = questionLower.split(/\s+/).filter(word => word.length > 3);
        questionWords.forEach(word => {
            if (input.includes(word)) {
                score += 1;
            }
        });

        if (score > highestScore) {
            highestScore = score;
            bestMatch = faq;
        }
    });

    // Require a minimum score to consider it a match
    if (highestScore >= 3 && bestMatch) {
        return bestMatch.answer;
    }

    return fallbackMessage;
};

// Legacy exports for backward compatibility (if used elsewhere)
export const faqData = [];
export const fallbackMessage = "";
export const quickActions = [];
