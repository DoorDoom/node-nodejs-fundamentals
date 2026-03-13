export class UnknownError extends Error {
  constructor() {
    super("Invalid input");
  }
}

export class FailError extends Error {
  constructor() {
    super("Operation failed");
  }
}
