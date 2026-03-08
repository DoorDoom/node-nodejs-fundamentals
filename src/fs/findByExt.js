import process from "process";
import fs from "fs";
import { readdir } from "node:fs/promises";

import { checkDirectory } from "../helpers.js";

const findByExt = async () => {
  try {
    const directoryPath = "./workspace";

    async function getFiles(rootPath, extension) {
      await readdir(rootPath, { recursive: true })
        .filter((elem) => {
          const myRe = new RegExp(`.${extension}$`, "g");
          return elem.search(myRe) > -1;
        })
        .sort()
        .forEach((elem) => {
          console.log(elem);
        });
    }

    //Get extension
    const args = process.argv;
    const index = args.findIndex((arg) => arg === "--ext");
    const extension = index !== -1 && args[index + 1] ? args[index + 1] : "txt";

    await checkDirectory(directoryPath);

    //Print file paths
    await getFiles(directoryPath, extension);
  } catch (err) {
    console.error(err);
  }
};

await findByExt();
