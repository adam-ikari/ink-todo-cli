import React from "react";
import { Text, Box, Newline, useInput, useApp } from "ink";
import { useStore } from "../store/taskStore.js";

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
      switch (input) {
        case "q":
          exit();
          return;
        case "j":
        case "ArrowDown":
          moveDown();
          break;
        case "k":
        case "ArrowUp":
          moveUp();
          break;
        case " ":
          toggleTask();
          break;
        case "d":
          deleteTask();
          break;
        case "a":
          setMode("add");
          break;
        case "e":
          if (tasks[selected]) {
            setInputValue(tasks[selected].label);
            setMode("edit");
          }
          break;
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
        <Box>
          <Text>
            {mode === "add"
              ? t("addTaskPrompt", { inputValue })
              : t("editTaskPrompt", { inputValue })
            }
          </Text>
        </Box>
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
