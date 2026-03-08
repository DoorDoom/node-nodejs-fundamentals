import { Worker, isMainThread, parentPort } from "node:worker_threads";
import { cpus } from "node:os";
import { checkDirectory } from "../helpers.js";
import { readFile } from "node:fs/promises";

function runWorker(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./src/wt/worker.js");
    worker.postMessage(data);

    worker.on("message", (data) => resolve(data));
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with ${code}`));
    });
  });
}

const main = async () => {
  const cores = cpus().length;
  const directoryPath = `${process.cwd()}/workspace/data.json`;

  console.log(cores);
  try {
    await checkDirectory(directoryPath);

    const data = JSON.parse(
      await readFile(directoryPath, { encoding: "utf8" }),
    );
    console.log(typeof data);
    const chunkQ = Math.ceil(data.length / cores);
    const output = new Array(cores);
    let cur = 0;

    for (let i = 0; i < cores; i++) {
      output[i] = data.slice(cur * chunkQ, (cur + 1) * chunkQ);
      cur++;
    }

    const results = await Promise.all(output.map((data) => runWorker(data)));

    const merged = results.flat().sort((a, b) => a - b);

    console.log(merged);

    process.exit(0);
  } catch (err) {
    console.log(err);
  }
};

await main();
