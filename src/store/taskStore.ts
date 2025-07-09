import { create } from "zustand";
import { Task, readTasks, writeTasks } from "../services/fileManager.js";
import {
  loadTranslations as i18nLoad,
  t as i18nT,
  TKey,
} from "../services/i18n.js";

type Mode = "list" | "add" | "error" | "loading";

interface AppState {
  // State
  tasks: Task[];
  selected: number;
  mode: Mode;
  inputValue: string;
  message: string | null;
  lang: string;

  // Actions
  init: (lang: string) => Promise<void>;
  t: (key: TKey, params?: Record<string, string>) => string;
  setMode: (mode: Mode) => void;
  setInputValue: (value: string) => void;
  clearMessage: () => void;
  moveUp: () => void;
  moveDown: () => void;
  addTask: () => void;
  toggleTask: () => void;
  deleteTask: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  // --- INITIAL STATE ---
  tasks: [],
  selected: 0,
  mode: "loading",
  inputValue: "",
  message: null,
  lang: "en",

  // --- ACTIONS ---

  /**
   * Initializes the application by loading translations and tasks.
   */
  init: async (lang: string) => {
    try {
      await i18nLoad(lang);
      const tasks = await readTasks();
      set({ lang, tasks, mode: "list" });
    } catch (err: any) {
      set({ mode: "error", message: err.message });
    }
  },

  /**
   * Gets a translation for the current language.
   */
  t: (key: TKey, params: Record<string, string> = {}) => {
    return i18nT(key, params);
  },

  setMode: (mode: Mode) => set({ mode }),

  setInputValue: (value: string) => set({ inputValue: value }),

  clearMessage: () => set({ message: null }),

  moveUp: () => {
    const { tasks, selected } = get();
    if (tasks.length > 0) {
      set({ selected: (selected - 1 + tasks.length) % tasks.length });
    }
  },

  moveDown: () => {
    const { tasks, selected } = get();
    if (tasks.length > 0) {
      set({ selected: (selected + 1) % tasks.length });
    }
  },

  addTask: () => {
    const { inputValue, tasks, t } = get();
    if (inputValue) {
      const newTasks = [...tasks, { label: inputValue, completed: false }];
      set({
        tasks: newTasks,
        message: t("messageAdded", { task: inputValue }),
      });
      writeTasks(newTasks);
    }
    set({ inputValue: "", mode: "list" });
  },

  toggleTask: () => {
    const { tasks, selected, t } = get();
    if (tasks[selected]) {
      const newTasks = tasks.map((task, i) =>
        i === selected ? { ...task, completed: !task.completed } : task
      );
      const task = newTasks[selected];
      set({
        tasks: newTasks,
        message: t("messageToggled", { task: task.label }),
      });
      writeTasks(newTasks);
    }
  },

  deleteTask: () => {
    const { tasks, selected, t } = get();
    if (tasks[selected]) {
      const taskToDelete = tasks[selected];
      const newTasks = tasks.filter((_, i) => i !== selected);
      const newSelected =
        selected >= newTasks.length && newTasks.length > 0
          ? newTasks.length - 1
          : selected;

      set({
        tasks: newTasks,
        selected: newSelected,
        message: t("messageDeleted", { task: taskToDelete.label }),
      });
      writeTasks(newTasks);
    }
  },
}));
