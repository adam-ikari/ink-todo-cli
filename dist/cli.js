#!/usr/bin/env node
import { jsx as _jsx } from "react/jsx-runtime";
import { render } from 'ink';
import meow from 'meow';
import App from './ui.js';
const cli = meow(`
	Usage
	  $ ink-todo-cli

	Options
		--lang  Language to use (e.g., 'en', 'zh')
`, {
    importMeta: import.meta,
    flags: {
        lang: {
            type: 'string',
            default: 'en',
        },
    },
});
render(_jsx(App, { lang: cli.flags.lang }));
