import { createHmac } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { Transform } from "stream";
import fs from "fs";

const directoryPath = "./workspace/files";

async function createHash(names) {
  for (const element of names) {
    const myTransform = new Transform({
      transform(chunk, encoding, callback) {
        callback(null, chunk.toString() + "\n");
      },
    });

    const contents = fs.createReadStream(`${directoryPath}/${element}`);

    const hash = createHmac("sha256", "secret");
    hash.setEncoding("hex");

    await pipeline(contents, hash, myTransform, process.stdout);
  }
}

const verify = async () => {
  const sourcePath = "./checksums.json";
  if (fs.existsSync("./checksums.json")) {
    const obj = JSON.parse(await fs.promises.readFile(sourcePath, "utf8"));
    for (let key of Reflect.ownKeys(obj)) {
      const myTransform = new Transform({
        transform(chunk, encoding, callback) {
          callback(
            null,
            key + ` - ${obj[key] === chunk.toString() ? "OK" : "Fail"}\n`,
          );
        },
      });

      const contents = fs.createReadStream(`${directoryPath}/${key}`);

      const hash = createHmac("sha256", "secret");
      hash.setEncoding("hex");

      await pipeline(contents, hash, myTransform, process.stdout);
    }
  } else {
    throw new Error("FS operation failed");
  }
};

verify();

// await createHash(["file1.txt", "file2.txt"]);
