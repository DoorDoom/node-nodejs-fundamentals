import fs from "fs";
import { checkDirectory } from "../helpers.js";
import { readFile, writeFile } from "node:fs/promises";

const restore = async () => {
  try {
    function restoreEntries(data, rootPath) {
      data.forEach(async (value) => {
        if (value.type === "file") {
          await writeFile(`${rootPath}/${value.path}`, value.content, {
            flag: "a+",
          });
        }
        if (value.type === "directory") {
          fs.mkdir(`${rootPath}/${value.path}`);
        }
      });
    }

    const filePath = "snapshot.json";
    const directoryPath = "./workspace_restored";

    // Get workspace
    if (fs.existsSync(directoryPath) || !fs.existsSync(filePath)) {
      console.log("The directory exists OR snapshot.json wasn't found");

      throw new Error("FS operation failed");
    } else {
      console.log("The directory does NOT exist");

      fs.mkdirSync(directoryPath);
    }

    await checkDirectory(filePath);

    // Get data
    const rawData = await readFile(filePath, "utf-8");
    const data = JSON.parse(rawData);

    restoreEntries(data.entries, directoryPath);
  } catch (err) {
    console.error(err);
  }
};

await restore();
