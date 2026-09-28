import type { ChangeEvent } from "react";

export function getNumericInputValue(value: number | undefined, blankZero = false) {
  if (value === undefined || (blankZero && value === 0)) return "";
  return value;
}

export function getNumericInputChangeValue(event: ChangeEvent<HTMLInputElement>) {
  return event.target.value === "" ? undefined : event.target.valueAsNumber;
}
