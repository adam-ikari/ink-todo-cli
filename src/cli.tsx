#!/usr/bin/env node
import React, {useEffect} from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './App.js';
import {useStore} from './store/taskStore.js';

const cli = meow(
	`
	Usage
	  $ mdtd [file]

	Options
		--lang  Language to use (e.g., 'en', 'zh')

	Arguments
		file    Path to the todo file (default: todo.md)
`,
	{
		importMeta: import.meta,
		flags: {
			lang: {
				type: 'string',
				default: 'en',
			},
		},
		input: {
			default: ['todo.md']
		}
	},
);

function Main() {
	const {init} = useStore();

	useEffect(() => {
		init(cli.flags.lang, cli.input[0]);
	}, [init]);

	return <App />;
}

render(<Main />);