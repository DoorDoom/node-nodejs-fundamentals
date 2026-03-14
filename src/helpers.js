import { access } from "node:fs/promises";

export function parseArgs(args, fields) {
  const result = new Map();

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, "");
    const value = key !== "save" ? args[i + 1] : true;

    if (fields.includes(key) && value !== undefined) {
      result.set(key, value);
    }
  }

  return result;
}

export async function checkFile(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
