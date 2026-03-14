import { FailError, UnknownError } from "./utils/errors.js";
import { kebabToCamel } from "./utils/helpers.js";
import { navigation } from "./navigation.js";
import { repl } from "./repl.js";
import { cwd } from "node:process";

async function start() {
  const progRoot = cwd();

  repl(async (line) => {
    const [cmd, ...args] = line.split(" ");
    if (navigation[cmd]) {
      await navigation[cmd](args);
    } else
      await import(`./commands/${kebabToCamel(cmd)}.js`)
        .then(async (module) => {
          await module.run(
            kebabToCamel(cmd) === "logStats"
              ? ["env", progRoot, ...args]
              : args,
          );
        })
        .catch((err) => {
          if (err instanceof FailError) throw err;
          throw new UnknownError();
        });
  });
}

start();
