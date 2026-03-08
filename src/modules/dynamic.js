import fs from "fs";
import process from "process";

const dynamic = async () => {
  const plugin = process.argv[2];
  const path = `${process.cwd()}/src/modules/plugins/${plugin}.js`;

  if (fs.existsSync(path))
    import(`./plugins/${plugin}.js`).then((module) => {
      console.log(module.run());
    });
  else throw new Error("Plugin not found");
};

await dynamic();
