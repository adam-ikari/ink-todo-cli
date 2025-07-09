import React from "react";
import { Text, Box } from "ink";
import type { TKey } from "../services/i18n.js";

type TFunction = (key: TKey, params: { inputValue: string }) => string;

type Props = {
  mode: "add" | "edit";
  inputValue: string;
  t: TFunction;
};

export default function InputBox({ mode, inputValue, t }: Props) {
  return (
    <Box>
      <Text>
        {mode === "add"
          ? t("addTaskPrompt", { inputValue })
          : t("editTaskPrompt", { inputValue })}
      </Text>
    </Box>
  );
}