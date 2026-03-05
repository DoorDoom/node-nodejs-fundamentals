import { createInterface } from "node:readline";
import { exit, stdin, stdout, cwd, uptime } from "node:process";

const interactive = () => {
  // Write your code here
  // Use readline module for interactive CLI
  // Support commands: uptime, cwd, date, exit
  // Handle Ctrl+C and unknown commands
  const rl = createInterface({
    input: stdin,
    output: stdout,
    prompt: "> ",
  });

  const cmds = {
    cwd: () => console.log(cwd()),
    uptime: () => console.log(`Uptime: ${uptime()}s`),
    exit: () => {
      console.log("Goodbye!");
      exit();
    },
    date: () => {
      const now = new Date();
      console.log(now.toISOString());
    },
  };

  rl.prompt();

  rl.on("line", (input) => {
    try {
      cmds[input]();
    } catch (err) {
      console.log("Unknown command");
    }
    rl.prompt();
  });

  rl.on("SIGINT", () => {
    console.log("\n Goodbye!");
    exit();
  });
};

interactive();
