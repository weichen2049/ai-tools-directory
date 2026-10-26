
import type { Choices } from "@lib/schema";


export function deepCloneChoices(choices: Choices): Choices {
  if (typeof structuredClone !== "undefined") {
    return structuredClone(choices);
  }
  return JSON.parse(JSON.stringify(choices)) as Choices;
}
