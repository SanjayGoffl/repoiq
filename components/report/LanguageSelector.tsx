'use client';

import { useState } from 'react';
import { Globe, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'hi', label: 'हिन्दी', flag: 'HI' },
  { code: 'ta', label: 'தமிழ்', flag: 'TA' },
  { code: 'te', label: 'తెలుగు', flag: 'TE' },
  { code: 'kn', label: 'ಕನ್ನಡ', flag: 'KN' },
  { code: 'bn', label: 'বাংলা', flag: 'BN' },
  { code: 'mr', label: 'मराठी', flag: 'MR' },
  { code: 'ml', label: 'മലയാളം', flag: 'ML' },
];

interface LanguageSelectorProps {
  text: string;
  onTranslated: (translated: string, lang: string) => void;
}

export function LanguageSelector({ text, onTranslated }: LanguageSelectorProps) {
  const [activeLang, setActiveLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [originalText] = useState(text);

  const handleTranslate = async (langCode: string) => {
    if (langCode === activeLang) return;

    if (langCode === 'en') {
      onTranslated(originalText, 'en');
      setActiveLang('en');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: originalText, target_lang: langCode }),
      });
      const data = await res.json();
      onTranslated(data.translated_text ?? originalText, langCode);
      setActiveLang(langCode);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      <Globe className="h-4 w-4 shrink-0 text-muted" />
      <div className="flex flex-wrap gap-1">
        {LANGUAGES.map((lang) => {
          const isActive = activeLang === lang.code;
          return (
            <Button
              key={lang.code}
              variant="ghost"
              size="sm"
              onClick={() => handleTranslate(lang.code)}
              disabled={loading}
              className={`h-7 gap-1 px-2 text-xs ${
                isActive
                  ? 'bg-green/10 text-green'
                  : 'text-muted hover:text-white'
              }`}
            >
              {isActive && <Check className="h-3 w-3" />}
              {lang.label}
            </Button>
          );
        })}
      </div>
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-green" />}
    </div>
  );
}
