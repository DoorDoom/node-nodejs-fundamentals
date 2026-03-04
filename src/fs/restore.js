import fs from "fs";
import path from "path";

const restore = async () => {
  try {
    function restoreEntries(data, rootPath) {
      data.forEach((value) => {
        if (value.type === "file") {
          fs.writeFileSync(`${rootPath}/${value.path}`, value.content, {
            flag: "a+",
          });
        }
        if (value.type === "directory") {
          fs.mkdirSync(`${rootPath}/${value.path}`);
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

    // Get data
    const rawData = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(rawData);

    restoreEntries(data.entries, directoryPath);
  } catch (err) {
    console.error(err);
  }
};

await restore();
