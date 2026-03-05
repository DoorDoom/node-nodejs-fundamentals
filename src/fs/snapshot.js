import fs from "fs";
import path from "path";

//Expected, that the directory "workspace" will be in the "npde-nodejs-fundamentals" directory
//Otherwise, it will be created there

const snapshot = async () => {
  try {
    function getEntries(rootPath) {
      const result = [];

      fs.readdirSync(rootPath, { recursive: true })
        .map((elem) => {
          return { path: elem, stats: fs.statSync(`${rootPath}/${elem}`) };
        })
        .forEach(({ path, stats }) => {
          const type = stats.isFile()
            ? "file"
            : stats.isDirectory()
              ? "directory"
              : null;

          if (type === "file") {
            result.push({
              path,
              type,
              size: stats.size,
              content: fs.readFileSync(`${rootPath}/${path}`, "utf8"),
            });
          }
          if (type === "directory") {
            result.push({
              path,
              type,
            });
          }
        });

      return result;
    }

    const directoryPath = "./workspace";

    // Get workspace
    if (fs.existsSync(directoryPath)) {
      console.log("The directory exists");
    } else {
      console.log("The directory does NOT exist");

      fs.mkdirSync(directoryPath);
      throw new Error("FS operation failed");
    }

    // Get data and create JSON
    const data = {
      rootPath: path.resolve(directoryPath),
      entries: getEntries(directoryPath),
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
