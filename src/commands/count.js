import { cwd } from "node:process";
import { createReadStream } from "node:fs";
import path from "node:path";
import { FailError } from "../utils/errors.js";
import { parseArgs, checkFile } from "../utils/helpers.js";
import { Transform } from "node:stream";
import { EOL } from "node:os";
import { pipeline } from "stream/promises";

export async function run(args) {
  const argMap = parseArgs(args, ["input"]);
  if (argMap.size < 1) {
    throw new FailError();
  }

  const filePath = path.resolve(cwd(), argMap.get("input"));
  const isExist = await checkFile(filePath);

  if (isExist) {
    const readStream = createReadStream(filePath, "utf-8");
    const transform = new Transform({
      transform(chunk, enc, cb) {
        const text = chunk.toString();
        const lines = text.split(EOL).length;
        const words = text.trim().split(/\s+/).length;
        const characters = text.length;

        console.log(
          `Lines: ${lines}\nWords: ${words}\nCharacters: ${characters}\n`,
        );
        cb();
      },
    });

    await pipeline(readStream, transform);
  } else throw new FailError();
}
