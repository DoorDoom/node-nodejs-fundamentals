import { cwd } from "node:process";
import { createReadStream } from "node:fs";
import path from "node:path";
import { FailError } from "../utils/errors.js";
import { parseArgs, checkFile } from "../utils/helpers.js";
import { createHash } from "node:crypto";

export async function run(args) {
  const argMap = parseArgs(args, ["input", "algorithm", "hash"]);
  if (argMap.get("input") === undefined || argMap.get("hash") === undefined) {
    throw new FailError();
  }

  const filePath = path.resolve(cwd(), argMap.get("input"));
  const hashFilePath = path.resolve(cwd(), argMap.get("hash"));
  const isExist = await checkFile(filePath);
  const isHashExist = await checkFile(hashFilePath);

  if (isExist && isHashExist) {
    const fileStream = createReadStream(filePath, "utf-8");
    const hashStream = createReadStream(hashFilePath, "utf-8");

    let result = "";

    for await (const chunk of fileStream) {
      const algorithm = argMap.get("algorithm") || "sha256";
      const hash = createHash(algorithm);
      hash.update(chunk);
      result = `${algorithm}: ${hash.digest("hex")}\n`;
    }

    for await (const chunk of hashStream) {
      return chunk.trim() === result.trim()
        ? console.log("OK")
        : console.log("MISMATCH");
    }
  } else throw new FailError();
}
