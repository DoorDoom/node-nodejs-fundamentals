export class UnknownCommand extends Error {
  constructor() {
    super("Invalid input");
  }
}
