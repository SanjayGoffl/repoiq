'use client';

import { useState } from 'react';
import { Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'mr', label: 'मराठी' },
  { code: 'ml', label: 'മലയാളം' },
];

interface LanguageSelectorProps {
  text: string;
  onTranslated: (translated: string, lang: string) => void;
}

export function LanguageSelector({ text, onTranslated }: LanguageSelectorProps) {
  const [activeLang, setActiveLang] = useState('en');
  const [loading, setLoading] = useState(false);

  const handleTranslate = async (langCode: string) => {
    if (langCode === activeLang) return;

    setLoading(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target_lang: langCode }),
      });
      const data = await res.json();
      onTranslated(data.translated_text ?? text, langCode);
      setActiveLang(langCode);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted" />
      <div className="flex flex-wrap gap-1">
        {LANGUAGES.map((lang) => (
          <Button
            key={lang.code}
            variant="ghost"
            size="sm"
            onClick={() => handleTranslate(lang.code)}
            disabled={loading}
            className={`h-7 px-2 text-xs ${
              activeLang === lang.code
                ? 'bg-green/10 text-green'
                : 'text-muted hover:text-white'
            }`}
          >
            {lang.label}
          </Button>
        ))}
      </div>
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted" />}
    </div>
  );
}
