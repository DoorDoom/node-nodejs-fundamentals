import { cwd } from "node:process";
import { createReadStream, createWriteStream } from "node:fs";
import path from "node:path";
import { FailError } from "../utils/errors.js";
import { parseArgs, checkFile } from "../utils/helpers.js";
import { Transform } from "node:stream";
import { pipeline } from "stream/promises";
import { promisify } from "node:util";
import { createDecipheriv, scrypt } from "node:crypto";

export async function run(args) {
  const argMap = parseArgs(args, ["input", "output", "password"]);
  if (argMap.size < 3) {
    throw new FailError();
  }

  const fromHex = (hex) => Buffer.from(hex, "hex");

  const filePath = path.resolve(cwd(), argMap.get("input"));
  const outputFilePath = path.resolve(cwd(), argMap.get("output"));
  const isExist = await checkFile(filePath);

  if (isExist) {
    const readStream = createReadStream(filePath, "utf-8");
    const transform = new Transform({
      async transform(chunk, enc, cb) {
        const text = chunk.toString();
        const password = argMap.get("password") || "";
        const [salt, iv, cipherText, authTag] = text
          .split("\n")
          .filter((v) => !!v)
          .map((v) => fromHex(v.split(": ")[1]));

        const scryptAsync = promisify(scrypt);
        const key = await scryptAsync(password, salt, 32);

        const decipher = createDecipheriv("aes-256-gcm", key, iv);
        decipher.setAuthTag(authTag);

        const result = Buffer.concat([
          decipher.update(cipherText, "hex"),
          decipher.final(),
        ]);
        cb(null, result);
      },
    });
    const writeStream = createWriteStream(
      path.resolve(cwd(), `${outputFilePath}`),
    );
    await pipeline(readStream, transform, writeStream);
  } else throw new FailError();
}
