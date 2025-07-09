#!/usr/bin/env node
import React, {useEffect} from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './components/App.js';
import {useStore} from './store/taskStore.js';

const cli = meow(
	`
	Usage
	  $ ink-todo-cli

	Options
		--lang  Language to use (e.g., 'en', 'zh')
`,
	{
		importMeta: import.meta,
		flags: {
			lang: {
				type: 'string',
				default: 'en',
			},
		},
	},
);

function Main() {
	const {init} = useStore();

	useEffect(() => {
		init(cli.flags.lang);
	}, [init]);

	return <App />;
}

render(<Main />);