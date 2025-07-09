import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Text, Box, Newline, useInput, useApp } from 'ink';
import { readTasks, writeTasks } from './file-manager.js';
import { loadTranslations, t } from './i18n.js';
export default function App({ lang }) {
    const [tasks, setTasks] = useState([]);
    const [selected, setSelected] = useState(0);
    const [mode, setMode] = useState('loading');
    const [inputValue, setInputValue] = useState('');
    const [message, setMessage] = useState(null);
    const { exit } = useApp();
    // Load translations and tasks on initial render
    useEffect(() => {
        async function init() {
            try {
                await loadTranslations(lang);
                const initialTasks = await readTasks();
                setTasks(initialTasks);
                setMode('list');
            }
            catch (err) {
                setMessage(err.message);
                setMode('error');
            }
        }
        init();
    }, [lang]);
    // Save tasks whenever they change
    useEffect(() => {
        // Only write tasks if we are in list mode and not in the middle of loading
        if (mode === 'list') {
            writeTasks(tasks).catch(err => {
                setMessage(err.message);
                setMode('error');
            });
        }
    }, [tasks, mode]);
    useInput((input, key) => {
        if (message)
            setMessage(null);
        if (mode === 'add') {
            if (key.return) {
                if (inputValue) {
                    setTasks([...tasks, { label: inputValue, completed: false }]);
                    setMessage(t('messageAdded', { task: inputValue }));
                }
                setInputValue('');
                setMode('list');
            }
            else if (key.backspace || key.delete) {
                setInputValue(val => val.slice(0, -1));
            }
            else {
                setInputValue(val => val + input);
            }
            return;
        }
        if (mode === 'list') {
            switch (input) {
                case 'q':
                    exit();
                    return;
                case 'j':
                case 'ArrowDown':
                    if (tasks.length > 0)
                        setSelected(s => (s + 1) % tasks.length);
                    break;
                case 'k':
                case 'ArrowUp':
                    if (tasks.length > 0)
                        setSelected(s => (s - 1 + tasks.length) % tasks.length);
                    break;
                case 'd':
                    if (tasks[selected]) {
                        const newTasks = [...tasks];
                        const task = newTasks[selected];
                        task.completed = !task.completed;
                        setTasks(newTasks);
                        setMessage(t('messageToggled', { task: task.label }));
                    }
                    break;
                case 'x':
                    if (tasks[selected]) {
                        const taskToDelete = tasks[selected];
                        const newTasks = tasks.filter((_, i) => i !== selected);
                        setTasks(newTasks);
                        setMessage(t('messageDeleted', { task: taskToDelete.label }));
                        // Adjust selection if the last item was deleted
                        if (selected >= newTasks.length && newTasks.length > 0) {
                            setSelected(newTasks.length - 1);
                        }
                    }
                    break;
                case 'a':
                    setMode('add');
                    break;
            }
        }
    });
    if (mode === 'loading') {
        return _jsx(Text, { children: "Loading..." });
    }
    if (mode === 'error') {
        return _jsx(Text, { color: "red", children: message });
    }
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Text, { bold: true, children: t('appTitle') }), _jsx(Newline, {}), tasks.map((task, index) => (_jsxs(Text, { color: selected === index ? 'cyan' : 'white', children: [selected === index ? '> ' : '  ', "[", task.completed ? 'x' : ' ', "] ", task.label] }, index))), tasks.length === 0 && mode === 'list' && _jsx(Text, { children: t('noTasks') }), _jsx(Newline, {}), mode === 'add' && (_jsx(Box, { children: _jsx(Text, { children: t('addTaskPrompt', { inputValue }) }) })), message && _jsx(Text, { color: "green", children: message }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", children: mode === 'list' ? t('controlsList') : t('controlsAdd') }) })] }));
}
