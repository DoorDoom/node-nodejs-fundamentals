import { spawn } from "node:child_process";

const execCommand = () => {
  const commandString = process.argv[2];

  const [command, ...args] = commandString.split(" ");

  const child = spawn(command, args, {
    stdio: ["inherit", "pipe", "pipe"],
    env: process.env,
    shell: true,
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on("exit", (code) => {
    process.exit(code);
  });
};

execCommand();
