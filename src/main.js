import { cwd, env, chdir } from "node:process";
import { readdir, lstat } from "node:fs/promises";
import { createInterface } from "node:readline";
import { UnknownError, FailError } from "./errors.js";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

async function start() {
  chdir(env.HOME);
  console.log("Welcome to Data Processing CLI!");
  console.log(`You are currently in ${cwd()}`);
  rl.prompt();

  const commands = {
    ".exit": () => {
      console.log("\nThank you for using Data Processing CLI!");
      process.exit(1);
    },
    up: () => {
      chdir("..");
    },
    cd: (newPath) => {
      try {
        chdir(newPath[0]);
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

  rl.on("line", async (line) => {
    const [cmd, ...args] = line.split(" ");

    try {
      // for (const cmd of Reflect.ownKeys(commands)) {
      //   console.log(cmd);
      // }
      if (commands[cmd]) {
        await commands[cmd](args);
        console.log(`You are currently in ${cwd()}`);
      } else throw new UnknownError();
    } catch (err) {
      console.log(err.message);
    }
    rl.prompt();
  });

  rl.on("close", () => {
    console.log("\nThank you for using Data Processing CLI!");
  });
}

start();
