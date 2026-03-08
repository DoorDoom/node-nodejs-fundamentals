import fs from "node:fs";

export async function checkDirectory(path) {
  await fs.access(path, fs.constants.F_OK, (err) => {
    if (err) {
      throw new Error("FS operation failed");
    }
  });
}
