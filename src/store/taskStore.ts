import { create } from "zustand";
import { Task, readTasks, writeTasks } from "@/services/fileManager.ts";
import { loadTranslations as i18nLoad, t, TKey } from "@/services/i18n.ts";

type Mode = "list" | "add" | "edit" | "error" | "loading";

interface TaskState {
  // State
  tasks: (Task & { level?: number })[];
  selected: number;
  mode: Mode;
  inputValue: string;
  message: string | null;
  lang: string;
  filePath: string;

  // Actions
  init: (lang: string, filePath?: string) => Promise<void>;
  setMode: (mode: Mode) => void;
  setInputValue: (value: string) => void;
  clearMessage: () => void;
  moveUp: () => void;
  moveDown: () => void;
  moveTaskUp: () => void;
  moveTaskDown: () => void;
  addTask: () => void;
  toggleTask: () => void;
  deleteTask: () => void;
  editTask: (newLabel: string) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
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

  setMode: (mode: Mode) => set({ mode }),

  setInputValue: (value: string) => set({ inputValue: value }),

  clearMessage: () => set({ message: null }),

  moveUp: () => {
    const { tasks, selected } = get();
    if (tasks.length === 0) return;
    const newSelected = selected > 0 ? selected - 1 : tasks.length - 1;
    set({ selected: newSelected });
  },

  moveDown: () => {
    const { tasks, selected } = get();
    if (tasks.length === 0) return;
    const newSelected = selected < tasks.length - 1 ? selected + 1 : 0;
    set({ selected: newSelected });
  },

  moveTaskUp: () => {
    const { tasks, selected, filePath } = get();
    if (selected <= 0 || tasks.length <= 1) return;

    const newTasks = [...tasks];
    [newTasks[selected], newTasks[selected - 1]] = [
      newTasks[selected - 1],
      newTasks[selected],
    ];
    set({
      tasks: newTasks,
      selected: selected - 1,
    });
    writeTasks(newTasks, filePath);
  },

  moveTaskDown: () => {
    const { tasks, selected, filePath } = get();
    if (selected >= tasks.length - 1 || tasks.length <= 1) return;

    const newTasks = [...tasks];
    [newTasks[selected], newTasks[selected + 1]] = [
      newTasks[selected + 1],
      newTasks[selected],
    ];
    set({
      tasks: newTasks,
      selected: selected + 1,
    });
    writeTasks(newTasks, filePath);
  },

  addTask: () => {
    const { inputValue, tasks, mode, selected } = get();
    if (inputValue) {
      let newTasks;
      let messageKey;

      if (mode === "edit") {
        newTasks = tasks.map((task, i) =>
          i === selected ? { ...task, label: inputValue } : task
        );
        messageKey = "messageEdited";
      } else {
        newTasks = [...tasks, { label: inputValue, completed: false, level: 0 }];
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
    const { tasks, selected } = get();
    if (tasks[selected]) {
      const newTasks = [...tasks];
      // 切换当前任务状态
      newTasks[selected] = {
        ...newTasks[selected],
        completed: !newTasks[selected].completed
      };

      // 检查并更新父任务状态
      const updateParentTask = (taskIndex: number) => {
        const currentLevel = newTasks[taskIndex].level || 0;
        // 查找父任务(最近的level较小的任务)
        for (let i = taskIndex - 1; i >= 0; i--) {
          if ((newTasks[i].level || 0) < currentLevel) {
            // 检查所有子任务是否完成
            const children = newTasks.slice(i + 1).filter(
              t => (t.level || 0) > (newTasks[i].level || 0)
            );
            const allChildrenCompleted = children.every(t => t.completed);
            // 更新父任务状态
            if (allChildrenCompleted !== newTasks[i].completed) {
              newTasks[i] = {
                ...newTasks[i],
                completed: allChildrenCompleted
              };
              // 递归更新更上层的父任务
              updateParentTask(i);
            }
            break;
          }
        }
      };

      updateParentTask(selected);

      const task = newTasks[selected];
      set({
        tasks: newTasks,
        message: t("messageToggled", { task: task.label }),
      });
      writeTasks(newTasks, get().filePath);
    }
  },

  deleteTask: () => {
    const { tasks, selected } = get();
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
    const { tasks, selected } = get();
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
