import process from "process";
import fs from "fs";

const merge = async () => {
  try {
    const directoryPath = "./workspace";
    const directoryPartsPath = "./workspace/parts";

    function mergeContent(rootPath, files) {
      let result = "";
      let fileList;

      if (files) {
        fileList = files.split(",");
        fileList.forEach((elem) => {
          if (!fs.accessSync(`${rootPath}/${elem}`)) {
            console.log("The file does NOT exist");
            throw new Error("FS operation failed");
          }
        });
      } else
        fileList = fs
          .readdirSync(rootPath, { recursive: true })
          .filter((elem) => {
            const myRe = new RegExp(`.txt$`, "g");
            return elem.search(myRe) > -1;
          })
          .sort();
      fileList.forEach((elem) => {
        const content = fs.readFileSync(`${rootPath}/${elem}`, "utf8");
        result = result + content;
      });
      return result;
    }

    //Get file list
    const args = process.argv;
    const index = args.findIndex((arg) => arg === "--files");
    const files = index !== -1 && args[index + 1] ? args[index + 1] : "";

    // Get workspace
    if (fs.existsSync(directoryPartsPath)) {
      console.log("The directory exists");
    } else {
      console.log("The directory does NOT exist");

      fs.mkdirSync(directoryPartsPath);
      throw new Error("FS operation failed");
    }

    // Get data and create JSON
    const data = mergeContent(directoryPartsPath, files);
    const promise = fs.writeFile(`${directoryPath}/merged.txt`, data, (err) => {
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

await merge();
