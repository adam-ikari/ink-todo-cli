import React, { useState } from "react";
import { Text, Box, Newline, useInput, useApp } from "ink";
import { useTaskStore } from "@/store/taskStore.ts";
import { Task, writeTasks } from "@/services/fileManager.ts";
import InputBox from "@/components/InputBox.tsx";
import { t } from "@/services/i18n.ts";

export default function App() {
  const { exit } = useApp();
  const {
    mode,
    message,
    tasks,
    selected,
    inputValue,
    clearMessage,
    setMode,
    setInputValue,
    moveUp,
    moveDown,
    moveTaskUp,
    moveTaskDown,
    addTask,
    toggleTask,
    deleteTask,
  } = useTaskStore();

  useInput((input, key) => {
    if (message) clearMessage();

    if (mode === "add" || mode === "edit") {
      if (key.return) {
        addTask();
      } else if (key.backspace || key.delete) {
        setInputValue(inputValue.slice(0, -1));
      } else {
        setInputValue(inputValue + input);
      }
      return;
    }

    if (mode === "list") {
      if (key.shift && (key.downArrow || input === "j" || input === "J")) {
        moveTaskDown();
      } else if (key.shift && (key.upArrow || input === "k" || input === "K")) {
        moveTaskUp();
      } else if (key.leftArrow || input === "h" || input === "H") {
        // 提升层级到父任务同级
        const { tasks, selected } = useTaskStore.getState();
        const currentLevel = tasks[selected]?.level || 0;

        // 查找最近的父任务
        let parentLevel = -1;
        for (let i = selected - 1; i >= 0; i--) {
          if ((tasks[i].level || 0) < currentLevel) {
            parentLevel = tasks[i].level || 0;
            break;
          }
        }

        if (parentLevel >= 0) {
          const newTasks = tasks.map(
            (task: Task & { level?: number }, i: number) =>
              i === selected ? { ...task, level: parentLevel } : task
          );
          useTaskStore.setState({ tasks: newTasks });
          writeTasks(newTasks, useTaskStore.getState().filePath);
        } else {
          useTaskStore.setState({
            message: "无法提升层级：找不到父任务",
          });
        }
      } else if (key.rightArrow || input === "l" || input === "L") {
        // 降低层级
        const { tasks, selected } = useTaskStore.getState();
        const currentLevel = tasks[selected]?.level || 0;
        if (selected > 0) {
          // 确保不是第一个任务
          const prevLevel = tasks[selected - 1]?.level || 0;
          let newLevel = currentLevel;

          if (currentLevel === 0) {
            // 顶级任务降级
            newLevel = prevLevel + 1; // 成为上一行任务的子任务
          } else {
            // 非顶级任务降级
            newLevel = prevLevel < currentLevel ? prevLevel : currentLevel - 1;
          }

          const newTasks = tasks.map(
            (task: Task & { level?: number }, i: number) =>
              i === selected ? { ...task, level: newLevel } : task
          );
          useTaskStore.setState({ tasks: newTasks });
          writeTasks(newTasks, useTaskStore.getState().filePath);
        } else {
          useTaskStore.setState({
            message: "第一个任务不能降低层级",
          });
        }
      } else if (key.downArrow || input === "j" || input === "J") {
        moveDown();
      } else if (key.upArrow || input === "k" || input === "K") {
        moveUp();
      } else {
        switch (input) {
          case "q":
          case "Q":
            exit();
            return;
          case " ":
            toggleTask();
            break;
          case "d":
          case "D":
            deleteTask();
            break;
          case "a":
          case "A":
            setMode("add");
            break;
          case "e":
          case "E":
            if (tasks[selected]) {
              setInputValue(tasks[selected].label);
              setMode("edit");
            }
            break;
        }
      }
    }
  });

  if (mode === "loading") {
    return <Text>Loading...</Text>;
  }

  if (mode === "error") {
    return <Text color="red">{message}</Text>;
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>{t("appTitle")}</Text>
      <Newline />

      {tasks.map((task: Task & { level?: number }, index: number) => (
        <Text key={index} color={selected === index ? "cyan" : "white"}>
          {selected === index ? "> " : "  "}
          {"  ".repeat(task.level || 0)}[{task.completed ? "x" : " "}]{" "}
          {task.label}
        </Text>
      ))}
      {tasks.length === 0 && mode === "list" && <Text>{t("noTasks")}</Text>}

      <Newline />

      {(mode === "add" || mode === "edit") && (
        <InputBox
          inputValue={inputValue}
          label={
            mode === "add"
              ? t("addTaskPrompt", { inputValue: "" })
              : t("editTaskPrompt", { inputValue: "" })
          }
        />
      )}

      {message && <Text color="green">{message}</Text>}

      <Box marginTop={1}>
        <Text color="gray">
          {mode === "list" ? t("controlsList") : t("controlsAdd")}
        </Text>
      </Box>
    </Box>
  );
}
