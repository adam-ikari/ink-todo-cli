import React, { useState, useEffect } from "react";
import { Text, Box, useInput } from "ink";
import type { TKey } from "../services/i18n.js";
import stringWidth from "string-width";

type TFunction = (key: TKey, params: { inputValue: string }) => string;

type Props = {
  mode: "add" | "edit";
  inputValue: string;
  t: TFunction;
};

function getVisualWidth(str: string) {
  return stringWidth(str);
}

export default function InputBox({ mode, inputValue, t }: Props) {
  const [showCursor, setShowCursor] = useState(true);
  const [cursorPos, setCursorPos] = useState(inputValue.length);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCursorPos(inputValue.length);
  }, [inputValue]);

  const visualWidth = getVisualWidth(inputValue);
  const minWidth = 8;
  const padding = Math.max(0, minWidth - visualWidth);

  return (
    <Box>
      <Text>
        {mode === "add"
          ? t("addTaskPrompt", { inputValue: "" })
          : t("editTaskPrompt", { inputValue: "" })}
      </Text>
      <Text backgroundColor="gray">
        {inputValue.slice(0, cursorPos)}
        {showCursor ? "█" : inputValue.slice(cursorPos, cursorPos + 1) || " "}
        {inputValue.slice(cursorPos + (showCursor ? 0 : 1))}
        {" ".repeat(padding)}
      </Text>
    </Box>
  );
}