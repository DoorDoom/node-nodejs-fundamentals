import { cwd } from "node:process";
import { createReadStream, createWriteStream } from "node:fs";
import path from "node:path";
import { FailError } from "../utils/errors.js";
import { parseArgs, checkFile } from "../utils/helpers.js";
import { Transform } from "node:stream";
import { EOL } from "node:os";
import { pipeline } from "stream/promises";

export async function run(args) {
  const argMap = parseArgs(args, ["input", "output"]);
  if (argMap.size < 2) {
    throw new FailError();
  }

  const filePath = path.resolve(cwd(), argMap.get("input"));
  const fileOutputPath = path.resolve(cwd(), argMap.get("output"));
  const isExist = await checkFile(filePath);

  if (isExist) {
    const readStream = createReadStream(filePath, "utf-8");
    const writeStream = createWriteStream(fileOutputPath);
    const transform = new Transform({
      transform(chunk, enc, cb) {
        const lines = chunk.toString().trim().split(EOL);
        const headers = lines[0].split(",");

        const result = lines.slice(1).map((line) => {
          const values = line.split(",");
          const obj = {};

          headers.forEach((header, i) => {
            obj[header] = values[i];
          });

          return obj;
        });

        cb(null, JSON.stringify(result));
      },
    });
    await pipeline(readStream, transform, writeStream);
  } else throw new FailError();
}
