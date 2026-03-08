import { Transform } from "stream";

//If use Windows, use syntax "echo 'hello\nworld'" => "echo 'hello\\nworld'"
const filter = () => {
  const args = process.argv;
  const index = args.findIndex((arg) => arg === "--pattern");
  const regular = index !== -1 && args[index + 1] ? args[index + 1] : null;
  let re;
  if (regular) re = new RegExp(regular);

  const myTransform = new Transform({
    transform(chunk, encoding, callback) {
      let leftover = "";
      const data = leftover + chunk.toString();
      const lines = data.split("\\n");

      const numbered =
        lines.filter((line) => (re ? re.test(line) : true)).join("\n") + "\n";

      callback(null, numbered);
    },
  });

  process.stdin.pipe(myTransform).pipe(process.stdout);
};

filter();
