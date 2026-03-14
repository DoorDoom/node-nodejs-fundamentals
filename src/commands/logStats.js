import { cwd } from "node:process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Worker } from "node:worker_threads";
import { cpus } from "node:os";
import { FailError } from "../utils/errors.js";
import { parseArgs, checkFile } from "../utils/helpers.js";

export async function run(args) {
  function runWorker(data) {
    return new Promise((resolve, reject) => {
      const workerFilePath = path.join(args[1], `/src/workers/logWorker.js`);
      const isExist = checkFile(workerFilePath);

      if (!isExist) return reject(new Error(`Worker file not found`));
      const worker = new Worker(workerFilePath);
      worker.postMessage(data);

      worker.on("message", (data) => {
        resolve(data);
        worker.terminate();
      });
      worker.on("error", () => {
        reject(new Error(`Worker error occurred`));
        worker.terminate();
      });
      worker.on("exit", (code) => {
        if (code !== 0) reject(new Error(`Worker stopped with ${code}`));
      });
    });
  }

  const argMap = parseArgs(args, ["input", "output"]);
  if (argMap.size < 2) {
    throw new FailError();
  }

  const cores = cpus().length;

  const filePath = path.resolve(cwd(), argMap.get("input"));
  const outputFilePath = path.resolve(cwd(), argMap.get("output"));
  const isExist = await checkFile(filePath);

  if (isExist) {
    const data = await readFile(filePath, { encoding: "utf8" });

    const lines = data
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const chunkQ = Math.ceil(lines.length / cores);
    const output = new Array(cores);

    for (let i = 0; i < cores; i++) {
      output[i] = lines.slice(i * chunkQ, (i + 1) * chunkQ);
    }

    const promiseResults = await Promise.all(
      output.map((data) => runWorker(data)),
    );

    let totalResponseTime = 0;

    const result = {
      total: 0,
      levels: {},
      status: {},
      topPath: [],
      avgResponseTimeMs: "0.00",
    };

    const topPathMap = {};

    for (const res of promiseResults) {
      result.total += res.total;

      totalResponseTime += Number(res.avgResponseTimeMs) * res.total;

      for (const [key, value] of Object.entries(res.levels || {})) {
        result.levels[key] = (result.levels[key] || 0) + value;
      }

      for (const [key, value] of Object.entries(res.status || {})) {
        result.status[key] = (result.status[key] || 0) + value;
      }

      for (const [key, value] of Object.entries(res.topPath || {})) {
        topPathMap[key] = (topPathMap[key] || 0) + value;
      }
    }

    result.topPath = Object.entries(topPathMap)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count);

    result.avgResponseTimeMs =
      result.total > 0 ? (totalResponseTime / result.total).toFixed(2) : "0.00";

    await writeFile(outputFilePath, JSON.stringify(result), {
      encoding: "utf8",
    });
  } else throw new FailError();
}
