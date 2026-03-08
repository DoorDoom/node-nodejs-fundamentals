import process from "process";
import fs from "fs";
import { checkDirectory } from "../helpers.js";
import { readdir, readFile } from "node:fs/promises";

const merge = async () => {
  try {
    const directoryPath = "./workspace";
    const directoryPartsPath = "./workspace/parts";

    async function mergeContent(rootPath, files) {
      let result = "";
      let fileList;

      if (files) {
        fileList = files.split(",");
        fileList.forEach(async (elem) => {
          await checkDirectory(`${rootPath}/${elem}`);
        });
      } else {
        fileList = await readdir(rootPath, { recursive: true });
        fileList
          .filter((elem) => {
            const myRe = new RegExp(`.txt$`, "g");
            return elem.search(myRe) > -1;
          })
          .sort();
      }

      if (fileList.length < 1) throw new Error("FS operation failed");

      const contents = await Promise.all(
        fileList.map((elem) => {
          return readFile(`${rootPath}/${elem}`, "utf8");
        }),
      );
      contents.forEach((content) => (result = result + content));

      return result;
    }

    //Get file list
    const args = process.argv;
    const index = args.findIndex((arg) => arg === "--files");
    const files = index !== -1 && args[index + 1] ? args[index + 1] : "";

    // Get workspace
    await checkDirectory(directoryPartsPath);

    // Get data and create JSON
    const data12 = await mergeContent(directoryPartsPath, files);
    console.log(data12);
    const promise = fs.writeFile(
      `${directoryPath}/merged.txt`,
      data12,
      (err) => {
        if (err) {
          return new Error("FS operation failed");
        }
        console.log("File has been written successfully!");
      },
    );

    return promise;
  } catch (err) {
    console.error(err);
  }
};

await merge();
