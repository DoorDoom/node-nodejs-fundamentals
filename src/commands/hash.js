import { cwd } from "node:process";
import { createReadStream, createWriteStream } from "node:fs";
import path from "node:path";
import { FailError } from "../utils/errors.js";
import { parseArgs, checkFile } from "../utils/helpers.js";
import { Transform } from "node:stream";
import { pipeline } from "stream/promises";
import { createHash } from "node:crypto";

export async function run(args) {
  const argMap = parseArgs(args, ["input", "algorithm", "save"]);
  if (argMap.get("input") === undefined) {
    throw new FailError();
  }

  const filePath = path.resolve(cwd(), argMap.get("input"));
  const isExist = await checkFile(filePath);

  if (isExist) {
    const readStream = createReadStream(filePath, "utf-8");
    const inSave = argMap.get("save") || false;
    const transform = new Transform({
      transform(chunk, enc, cb) {
        const algorithm = argMap.get("algorithm") || "sha256";
        const hash = createHash(algorithm);
        hash.update(chunk);
        const result = `${algorithm}: ${hash.digest("hex")}\n`;
        if (inSave) cb(null, result);
        else {
          console.log(result);
          cb();
        }
      },
    });
    if (inSave) {
      const writeStream = createWriteStream(
        path.resolve(cwd(), `${path.parse(filePath).name}.hash`),
      );
      await pipeline(readStream, transform, writeStream);
    } else await pipeline(readStream, transform);
  } else throw new FailError();
}
