import fs from 'node:fs/promises';
import path from 'node:path';

// Define a type for our translation keys for better type-safety
export type TKey =
	| 'appTitle'
	| 'noTasks'
	| 'addTaskPrompt'
	| 'messageAdded'
	| 'messageToggled'
	| 'messageDeleted' // Add the new key here
	| 'controlsList'
	| 'controlsAdd';

let translations: Record<string, string> = {};

/**
 * Loads the translation file for the given language.
 * Falls back to English if the specified language is not found.
 * @param lang The language code (e.g., 'en', 'zh').
 */
export async function loadTranslations(lang: string): Promise<void> {
	let filePath = path.resolve(
		process.cwd(),
		`src/locales/${lang}.json`,
	);

	try {
		await fs.access(filePath);
	} catch {
		// Fallback to English if the language file doesn't exist
		filePath = path.resolve(process.cwd(), `src/locales/en.json`);
	}

	const content = await fs.readFile(filePath, 'utf-8');
	translations = JSON.parse(content);
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