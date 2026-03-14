import { parentPort, threadId } from "worker_threads";
import { FailError } from "../utils/errors.js";

parentPort.on("message", (data) => {
  try {
    const result = {
      total: 0,
      levels: {},
      status: { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0 },
      topPath: {},
      avgResponseTimeMs: 0,
    };

    let overallTime = 0;

    data.forEach((line, index) => {
      try {
        const [timestamp, level, service, status, responseTime, method, path] =
          line.split(" ");

        const tempStat = `${status[0]}xx`;

        result.total += 1;
        overallTime += Number(responseTime);

        result.levels[level]
          ? (result.levels[level] += 1)
          : (result.levels[level] = 1);

        result.status[tempStat] += 1;

        result.topPath[path]
          ? (result.topPath[path] += 1)
          : (result.topPath[path] = 1);
      } catch (err) {
        throw new FailError();
      }
    });

    result.avgResponseTimeMs =
      result.total > 0 ? (overallTime / result.total).toFixed(2) : "0.00";

    parentPort.postMessage(result);
  } catch (err) {
    throw new FailError();
  }
});
