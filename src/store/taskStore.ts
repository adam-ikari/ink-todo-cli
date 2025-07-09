import { create } from "zustand";
import { Task, readTasks, writeTasks } from "../services/fileManager.js";
import {
  loadTranslations as i18nLoad,
  t as i18nT,
  TKey,
} from "../services/i18n.js";

type Mode = "list" | "add" | "edit" | "error" | "loading";

interface AppState {
  // State
  tasks: Task[];
  selected: number;
  mode: Mode;
  inputValue: string;
  message: string | null;
  lang: string;
  filePath: string;

  // Actions
  init: (lang: string, filePath?: string) => Promise<void>;
  t: (key: TKey, params?: Record<string, string>) => string;
  setMode: (mode: Mode) => void;
  setInputValue: (value: string) => void;
  clearMessage: () => void;
  moveUp: () => void;
  moveDown: () => void;
  addTask: () => void;
  toggleTask: () => void;
  deleteTask: () => void;
  editTask: (newLabel: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // --- INITIAL STATE ---
  tasks: [],
  selected: 0,
  mode: "loading",
  inputValue: "",
  message: null,
  lang: "en",
  filePath: "todo.md",

  // --- ACTIONS ---

  /**
   * Initializes the application by loading translations and tasks.
   */
  init: async (lang: string, filePath = "todo.md") => {
    try {
      await i18nLoad(lang);
      const tasks = await readTasks(filePath);
      set({ lang, tasks, mode: "list", filePath });
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
    const { inputValue, tasks, t, mode, selected } = get();
    if (inputValue) {
      let newTasks;
      let messageKey;

      if (mode === "edit") {
        newTasks = tasks.map((task, i) =>
          i === selected ? { ...task, label: inputValue } : task
        );
        messageKey = "messageEdited";
      } else {
        newTasks = [...tasks, { label: inputValue, completed: false }];
        messageKey = "messageAdded";
      }

      set({
        tasks: newTasks,
        message: t(messageKey as TKey, { task: inputValue }),
      });
      writeTasks(newTasks, get().filePath);
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
      writeTasks(newTasks, get().filePath);
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
      writeTasks(newTasks, get().filePath);
    }
  },

  editTask: (newLabel: string) => {
    const { tasks, selected, t } = get();
    if (tasks[selected] && newLabel) {
      const newTasks = tasks.map((task, i) =>
        i === selected ? { ...task, label: newLabel } : task
      );
      set({
        tasks: newTasks,
        message: t("messageEdited", { task: newLabel }),
      });
      writeTasks(newTasks, get().filePath);
    }
  },
}));
