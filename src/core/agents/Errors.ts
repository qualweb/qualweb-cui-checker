export class InvalidGraphInitialInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidGraphInitialInputError";
  }
}

export class DomainObtainerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainObtainerError";
  }
}