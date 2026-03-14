import { cwd, env, chdir } from "node:process";
import { createInterface } from "node:readline";
import { UnknownError } from "./errors.js";
import { commands } from "./commands.js";

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

  rl.on("line", async (line) => {
    const [cmd, ...args] = line.split(" ");

    try {
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
