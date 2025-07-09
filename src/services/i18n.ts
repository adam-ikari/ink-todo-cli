import enTranslations from '../locales/en.json' with { type: 'json' };
import zhTranslations from '../locales/zh.json' with { type: 'json' };

// Define a type for our translation keys for better type-safety
export type TKey =
	| 'appTitle'
	| 'noTasks'
	| 'addTaskPrompt'
	| 'editTaskPrompt'
	| 'messageAdded'
	| 'messageToggled'
	| 'messageDeleted'
	| 'controlsList'
	| 'controlsAdd';

const translationsMap = {
	en: enTranslations,
	zh: zhTranslations
};

let translations: Record<string, string> = translationsMap.en;

/**
 * Loads the translation for the given language.
 * Falls back to English if the specified language is not found.
 * @param lang The language code (e.g., 'en', 'zh').
 */
export function loadTranslations(lang: string): void {
	translations = translationsMap[lang as keyof typeof translationsMap] || translationsMap.en;
}

/**
 * Gets the translation for a given key and replaces placeholders.
 * @param key The translation key.
 * @param params An object with values for placeholder replacement.
 * @returns The translated and formatted string.
 */
export function t(key: TKey, params: Record<string, string> = {}): string {
	let text = translations[key] || key;
	for (const [param, value] of Object.entries(params)) {
		text = text.replace(`{${param}}`, value);
	}
	return text;
}