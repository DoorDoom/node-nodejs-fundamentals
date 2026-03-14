import { cwd, chdir } from "node:process";
import { readdir, lstat } from "node:fs/promises";
import { FailError } from "./utils/errors.js";

export const navigation = {
  ".exit": () => {
    console.log("\nThank you for using Data Processing CLI!");
    process.exit(1);
  },
  up: () => {
    chdir("..");
  },
  cd: (args) => {
    try {
      chdir(args[0]);
    } catch (err) {
      throw new FailError();
    }
  },
  ls: async () => {
    const result = { files: [], folders: [] };
    try {
      const files = await readdir(cwd());
      for (const file of files) {
        const stats = await lstat(`${cwd()}/${file}`);
        const isDir = stats.isDirectory();
        if (isDir) {
          result.folders.push(` ${file} \t folder \n`);
        } else {
          result.files.push(` ${file} \t file \n`);
        }
      }
      result.files.sort();
      result.folders.sort();
      console.log(result.folders.join(""));
      console.log(result.files.join(""));
    } catch (err) {
      throw new FailError();
    }
  },
};
