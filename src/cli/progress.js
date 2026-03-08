import process from "process";

//Must be used by package.json script
const progress = () => {
  const params = ["duration", "interval", "color", "length"];
  const args = process.argv;

  const findValue = (param) => {
    const index = args.findIndex((arg) => arg === `--${param}`);
    return index !== -1 && args[index + 1] ? args[index + 1] : null;
  };

  const hexToRGB = (color) => {
    if (color.toString()[0] == "#") {
      color = color.toString();
      const result = {
        r: parseInt(color.substring(1, 3), 16),
        g: parseInt(color.substring(3, 5), 16),
        b: parseInt(color.substring(5, 7), 16),
      };

      if (!result.r || !result.g || !result.b) return null;

      return result;
    }
  };

  //Get params from env
  const details = {};
  params.forEach((element) => {
    if (element == "color") {
      details[element] = findValue(element)
        ? hexToRGB(findValue(element))
        : null;
    } else details[element] = findValue(element);
  });

  //Bar
  let currentTick = 0;
  const duration = details.duration ?? 5000;
  const interval = details.interval ?? 100;
  const length = details.length ?? 30;

  const maxTick = duration / interval;

  const drawBar = (cur, max, length) => {
    let result = "";
    for (let i = 0; i <= length; i++) {
      result += i / length <= cur / max ? "█" : " ";
    }

    details.color
      ? process.stdout.write(
          `\r[\x1b[38;2;${details.color.r};${details.color.g};${details.color.b}m${result}\x1b[0m] ${(cur / max) * 100}%`,
        )
      : process.stdout.write(`\r[${result}] ${(cur / max) * 100}%`);
  };

  const intervalId = setInterval(
    // () => process.stdout.write("\x1b[33m Welcome to the app! \x1b[0m"),
    () => {
      currentTick++;
      drawBar(currentTick, maxTick, length);
    },
    interval,
  );

  setTimeout(() => {
    clearInterval(intervalId);
  }, duration);

  setTimeout(() => {
    drawBar(maxTick, maxTick, length);
    console.log("\n Done!");
  }, duration);

  // console.log(details);
  // console.log("\x1b[33m Welcome to the app! \x1b[0m");
};

progress();
