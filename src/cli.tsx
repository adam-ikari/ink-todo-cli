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
		-f, --file  Path to the todo file (default: todo.md)
`,
	{
		importMeta: import.meta,
		flags: {
			lang: {
				type: 'string',
				default: 'en',
			},
			file: {
				type: 'string',
				default: 'todo.md',
				shortFlag: 'f',
			},
		},
	},
);

function Main() {
	const {init} = useStore();

	useEffect(() => {
		init(cli.flags.lang, cli.flags.file);
	}, [init]);

	return <App />;
}

render(<Main />);