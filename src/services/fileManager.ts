import fs from 'node:fs/promises';
import path from 'node:path';

export interface Task {
	label: string;
	completed: boolean;
}

/**
 * Parses the content of the todo file into a list of tasks.
 * @param content The string content of the file.
 * @returns An array of Task objects.
 */
function parseTasks(content: string): Task[] {
	const lines = content.split('\n').filter(line => line.startsWith('- ['));
	return lines.map(line => {
		const completed = line.startsWith('- [x]');
		const label = line.replace(/- \[[x ]\] /, '').trim();
		return {label, completed};
	});
}

/**
 * Formats a list of tasks into the todo file format.
 * @param tasks An array of Task objects.
 * @returns A string formatted for the markdown file.
 */
function formatTasks(tasks: Task[]): string {
	return tasks
		.map(task => `- [${task.completed ? 'x' : ' '}] ${task.label}`)
		.join('\n');
}

/**
 * Reads tasks from the specified file.
 * If the file doesn't exist, it returns an empty array.
 * @param filePath Path to the todo file (default: 'todo.md')
 * @returns A promise that resolves to an array of Task objects.
 */
export async function readTasks(filePath = 'todo.md'): Promise<Task[]> {
	try {
		const fullPath = path.resolve(process.cwd(), filePath);
		const content = await fs.readFile(fullPath, 'utf-8');
		return parseTasks(content);
	} catch (error: any) {
		// If the file doesn't exist, return an empty list.
		if (error.code === 'ENOENT') {
			return [];
		}
		throw error;
	}
}

/**
 * Writes tasks to the specified file.
 * @param tasks An array of Task objects.
 * @param filePath Path to the todo file (default: 'todo.md')
 * @returns A promise that resolves when the file has been written.
 */
export async function writeTasks(tasks: Task[], filePath = 'todo.md'): Promise<void> {
	const fullPath = path.resolve(process.cwd(), filePath);
	const content = formatTasks(tasks);
	await fs.writeFile(fullPath, content, 'utf-8');
}
