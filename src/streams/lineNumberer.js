import { Transform } from "stream";

//If use Windows, use syntax "echo 'hello\nworld'" => "echo 'hello\\nworld'"
const lineNumberer = () => {
  const myTransform = new Transform({
    transform(chunk, encoding, callback) {
      let lineNumber = 1;
      let leftover = "";
      const data = leftover + chunk.toString();
      console.log(data);
      const lines = data.split("\\n");
      console.log(lines);

      const numbered =
        lines.map((line) => `${lineNumber++} | ${line}`).join("\n") + "\n";

      callback(null, numbered);
    },
  });

  process.stdin.pipe(myTransform).pipe(process.stdout);
};

lineNumberer();
