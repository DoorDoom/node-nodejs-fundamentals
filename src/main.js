import { cwd, env, chdir } from "node:process";
import { createInterface } from "node:readline";
import { UnknownCommand } from "./errors.js";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

function start() {
  chdir(env.HOME);
  console.log("Welcome to Data Processing CLI!");
  console.log(`You are currently in ${cwd()}`);
  rl.prompt();

  const commands = {
    ".exit": () => {
      console.log("\nThank you for using Data Processing CLI!");
      process.exit(1);
    },
    add: () => {},
  };

  rl.on("line", (line) => {
    try {
      if (commands[line]) {
        commands[line]();
        console.log(`You are ${env.HOME}`);
        console.log(`You are currently in ${cwd()}`);
      } else throw new UnknownCommand();
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
