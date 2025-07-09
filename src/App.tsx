import React from "react";
import { Text, Box, Newline, useInput, useApp } from "ink";
import { useStore } from "./store/taskStore.ts";
import InputBox from "./components/InputBox.tsx";

export default function App() {
  const { exit } = useApp();
  const {
    mode,
    message,
    tasks,
    selected,
    inputValue,
    t,
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
  } = useStore();

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

      {tasks.map((task, index) => (
        <Text key={index} color={selected === index ? "cyan" : "white"}>
          {selected === index ? "> " : "  "}[{task.completed ? "x" : " "}]{" "}
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
