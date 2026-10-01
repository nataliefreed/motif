import { derived, writable } from 'svelte/store';
import { en, type Messages } from './en';
import { es } from './es';
import { fr } from './fr';

// The interface language. Components read text from `$t`, e.g. `$t.toolbar.save`,
// so everything on screen follows the language picker.

export const languages = { en: 'English', es: 'Español', fr: 'Français' };
export type Language = keyof typeof languages;
export type { Messages };

const messages: Record<Language, Messages> = { en, es, fr };

// Help for the language picker is in every language at once, so anyone can find it.
export const languagePickerHelp = 'Language · Idioma · Langue';

const savedLanguageKey = 'motif-language';

export const language = writable<Language>(startingLanguage());
export const t = derived(language, $language => messages[$language]);

// The language picked last time on this device, or else the browser's language if MOTIF has it.
function startingLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  let saved: string | null = null;
  try { saved = localStorage.getItem(savedLanguageKey); } catch { /* storage blocked */ }
  if (isLanguage(saved)) return saved;
  const preferred = navigator.languages.map(tag => tag.slice(0, 2)).find(isLanguage);
  return preferred ?? 'en';
}

function isLanguage(code: string | null): code is Language {
  return code !== null && code in languages;
}

if (typeof window !== 'undefined') {
  language.subscribe(code => {
    try { localStorage.setItem(savedLanguageKey, code); } catch { /* storage blocked */ }
    document.documentElement.lang = code;
  });
}

// Text keyed by a name from the tool catalog or a drawing, which might not have an entry.
export function entry<T>(table: Record<string, T>, key: string): T | undefined {
  return Object.hasOwn(table, key) ? table[key] : undefined;
}

// A recipe step phrase split into the words around its settings: words[i] comes before setting {i},
// and the last entry comes after the last setting. See the note at the top of en.ts.
export function phraseWords(phrase: string): string[] {
  return phrase.split(/\{\d+\}/);
}

// Default names (see `titles` in en.ts) are shown in the current language, whichever language
// they were saved in. Any other name is the person's own, and is shown as they wrote it.
export const displayTitle = derived(language, $language => (title: string) => {
  for (const [english, current] of Object.entries(messages[$language].titles)) {
    const isThisDefault = Object.values(messages).some(m => entry(m.titles, english) === title);
    if (isThisDefault) return current;
  }
  return title;
});
