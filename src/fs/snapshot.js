import fs from "fs";
import path from "path";
import { checkDirectory } from "../helpers.js";
import { readdir, readFile, stat } from "node:fs/promises";

const snapshot = async () => {
  try {
    async function getEntries(rootPath) {
      const result = [];

      const entries = await readdir(rootPath, { recursive: true });

      for (const elem of entries) {
        const stats = await stat(`${rootPath}/${elem}`);

        const type = stats.isFile()
          ? "file"
          : stats.isDirectory()
            ? "directory"
            : null;

        if (type === "file") {
          result.push({
            path: elem,
            type,
            size: stats.size,
            content: await readFile(`${rootPath}/${elem}`, "utf8"),
          });
        }

        if (type === "directory") {
          result.push({
            path: elem,
            type,
          });
        }
      }

      return result;
    }

    const directoryPath = "./workspace";

    // Get workspace
    await checkDirectory(directoryPath);
    // Get data and create JSON
    const data = {
      rootPath: path.resolve(directoryPath),
      entries: await getEntries(directoryPath),
    };

    const jsonData = JSON.stringify(data, null, 2);
    const promise = fs.writeFile("snapshot.json", jsonData, (err) => {
      if (err) {
        return new Error("FS operation failed");
      }
      console.log("File has been written successfully!");
    });

    return promise;
  } catch (err) {
    console.error(err);
  }
};

await snapshot();
