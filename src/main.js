import { UnknownError } from "./utils/errors.js";
import { kebabToCamel } from "./utils/helpers.js";
import { navigation } from "./navigation.js";
import { repl } from "./repl.js";

async function start() {
  repl(async (line) => {
    const [cmd, ...args] = line.split(" ");
    if (navigation[cmd]) {
      await navigation[cmd](args);
    } else
      await import(`./commands/${kebabToCamel(cmd)}.js`)
        .then(async (module) => {
          await module.run(args);
        })
        .catch(() => {
          throw new UnknownError();
        });
  });
}

start();
