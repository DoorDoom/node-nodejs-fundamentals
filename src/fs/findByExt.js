import process from "process";
import fs from "fs";

const findByExt = async () => {
  try {
    const directoryPath = "./workspace";

    function getFiles(rootPath, extension) {
      fs.readdirSync(rootPath, { recursive: true })
        .map((elem) => {
          return elem;
        })
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

    // Get workspace
    if (fs.existsSync(directoryPath)) {
      console.log("The directory exists");
    } else {
      console.log("The directory does NOT exist");

      fs.mkdirSync(directoryPath);
      throw new Error("FS operation failed");
    }

    //Print file paths
    getFiles(directoryPath, extension);
  } catch (err) {
    console.error(err);
  }
};

await findByExt();
