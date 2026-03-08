import fs from "fs";
import os from "os";
import { Transform } from "stream";

//If use Windows, use syntax "echo 'hello\nworld'" => "echo 'hello\\nworld'"
const split = async () => {
  const sourcePath = `${process.cwd()}/src/streams/source.txt`;
  const outputPath = `${process.cwd()}/src/streams/`;
  const args = process.argv;
  const index = args.findIndex((arg) => arg === "--lines");
  const linesQ = index !== -1 && args[index + 1] ? args[index + 1] : 10;

  if (fs.existsSync(sourcePath)) {
    const readStream = new fs.createReadStream(sourcePath);

    const partsTransform = new Transform({
      transform(chunk, encoding, callback) {
        const data = chunk.toString();
        const lines = data.split(os.EOL);
        const filesQ = Math.ceil(lines.length / linesQ);
        let cur = 0;

        for (let i = 1; i <= filesQ; i++) {
          const writable = fs.createWriteStream(`${outputPath}output${i}.txt`);
          const result = lines
            .slice(cur * linesQ, (cur + 1) * linesQ)
            .join(os.EOL);
          writable.write(result);
          cur++;
        }
        callback();
      },
    });

    readStream.pipe(partsTransform);
  }
};

await split();
