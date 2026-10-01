import { describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { effectList } from '../stores/effectList';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { displayTitle, entry, language, phraseWords } from './index';

const translations = { es, fr };

// the settings placeholders in a recipe step phrase, in the order they appear
function placeholders(phrase: string): string[] {
  return phrase.match(/\{\d+\}/g) ?? [];
}

describe('interface text', () => {
  it('has a label and help for every drawing tool, in every language', () => {
    for (const messages of [en, ...Object.values(translations)]) {
      for (const tool of effectList) {
        const text = entry(messages.tools, tool.textLabel);
        expect(text?.label, tool.textLabel).toBeTruthy();
        expect(text?.help, tool.textLabel).toBeTruthy();
      }
    }
  });

  it('keeps every recipe step\'s settings in order, in every language', () => {
    for (const [key, english] of Object.entries(en.steps)) {
      const settings = placeholders(english);
      expect(settings, key).toEqual(settings.map((_, i) => `{${i}}`));
      for (const [code, messages] of Object.entries(translations)) {
        expect(placeholders(entry(messages.steps, key) ?? ''), `${code}: ${key}`).toEqual(settings);
      }
    }
  });

  it('splits a step phrase into the words around its settings', () => {
    expect(phraseWords('**polígono** de {0} lados de radio {1}')).toEqual(['**polígono** de ', ' lados de radio ', '']);
  });

  it('translates every default name MOTIF gives to brushes', () => {
    const brushTitles = effectList.flatMap(tool =>
      Object.values(tool.nestedActions ?? {}).map(action => action.params.title).filter(Boolean));
    for (const title of brushTitles) {
      expect(entry(en.titles, title), title).toBe(title);
    }
  });
});

describe('displayTitle', () => {
  it('shows default names in the current language, whichever language they were saved in', () => {
    language.set('es');
    expect(get(displayTitle)('How To Make My Design')).toBe('La receta de mi diseño');
    language.set('en');
    expect(get(displayTitle)('pincel de puntos')).toBe('dot brush');
  });

  it('leaves names people wrote themselves as they are', () => {
    language.set('es');
    expect(get(displayTitle)('my cat brush')).toBe('my cat brush');
    language.set('en');
  });
});
