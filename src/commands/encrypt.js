import { cwd } from "node:process";
import { createReadStream, createWriteStream } from "node:fs";
import path from "node:path";
import { FailError } from "../utils/errors.js";
import { parseArgs, checkFile } from "../utils/helpers.js";
import { Transform } from "node:stream";
import { pipeline } from "stream/promises";
import { promisify } from "node:util";
import { createCipheriv, randomBytes, scrypt } from "node:crypto";

export async function run(args) {
  const argMap = parseArgs(args, ["input", "output", "password"]);
  if (argMap.size < 3) {
    throw new FailError();
  }

  const filePath = path.resolve(cwd(), argMap.get("input"));
  const outputFilePath = path.resolve(cwd(), argMap.get("output"));
  const isExist = await checkFile(filePath);

  if (isExist) {
    const readStream = createReadStream(filePath, "utf-8");
    const transform = new Transform({
      async transform(chunk, enc, cb) {
        const text = chunk.toString();
        const algorithm = "aes-256-gcm";
        const password = argMap.get("password") || "";
        const salt = randomBytes(16);
        const iv = randomBytes(12);

        const scryptAsync = promisify(scrypt);
        const key = await scryptAsync(password, salt, 32);

        const cipher = createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");

        const result = `Salt: ${salt.toString("hex")}\nIv: ${iv.toString("hex")}\nCipherText: ${encrypted}\n AuthTag: ${cipher.getAuthTag().toString("hex")}\n`;
        cb(null, result);
      },
    });
    const writeStream = createWriteStream(
      path.resolve(cwd(), `${outputFilePath}`),
    );
    await pipeline(readStream, transform, writeStream);
  } else throw new FailError();
}
