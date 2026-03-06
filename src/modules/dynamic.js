const dynamic = async () => {
  const directoryPath = "./plugins";
  const plugin = process.argv[2];

  try {
    if (plugin) {
      await import(`${directoryPath}/${plugin}.js`).then((module) => {
        console.log(module.run());
      });
    } else {
      throw new Error("Plugin not found");
    }
  } catch (error) {
    console.log(error);
  }
};

await dynamic();
