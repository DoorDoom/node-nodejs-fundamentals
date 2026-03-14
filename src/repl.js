import { createInterface } from "node:readline";
import { cwd, env, chdir } from "node:process";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

export function repl(cb) {
  chdir(env.HOME);
  console.log("Welcome to Data Processing CLI!");
  console.log(`You are currently in ${cwd()}`);
  rl.prompt();

  rl.on("line", async (line) => {
    try {
      await cb(line);
      console.log(`You are currently in ${cwd()}`);
    } catch (err) {
      console.log(err.message);
    }
    rl.prompt();
  });

  rl.on("close", () => {
    console.log("\nThank you for using Data Processing CLI!");
  });
}
