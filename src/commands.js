import { cwd, chdir, stdout } from "node:process";
import { readdir, lstat, readFile } from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import path from "node:path";
import { FailError } from "./errors.js";
import { parseArgs, checkFile } from "./helpers.js";
import { Transform } from "node:stream";
import { EOL } from "node:os";
import { pipeline } from "stream/promises";
import { createHash } from "node:crypto";

export const commands = {
  ".exit": () => {
    console.log("\nThank you for using Data Processing CLI!");
    process.exit(1);
  },
  up: () => {
    chdir("..");
  },
  cd: (args) => {
    try {
      chdir(args[0]);
    } catch (err) {
      throw new FailError();
    }
  },
  ls: async () => {
    const result = { files: [], folders: [] };
    try {
      const files = await readdir(cwd());
      for (const file of files) {
        const stats = await lstat(`${cwd()}/${file}`);
        const isDir = stats.isDirectory();
        if (isDir) {
          result.folders.push(` ${file} \t folder \n`);
        } else {
          result.files.push(` ${file} \t file \n`);
        }
      }
      result.files.sort();
      result.folders.sort();
      console.log(result.folders.join(""));
      console.log(result.files.join(""));
    } catch (err) {
      throw new FailError();
    }
  },
  "csv-to-json": async (args) => {
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
  },
  "json-to-csv": async (args) => {
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
          const data = JSON.parse(chunk.toString());
          if (!Array.isArray(data) || data.length === 0) return "";

          const headers = Object.keys(data[0]);

          const rows = data.map((obj) => headers.map((h) => obj[h]).join(","));

          cb(null, [headers.join(","), ...rows].join(EOL));
        },
      });
      await pipeline(readStream, transform, writeStream);
    } else throw new FailError();
  },
  count: async (args) => {
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
  },
  hash: async (args) => {
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
  },
};
