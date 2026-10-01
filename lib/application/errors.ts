export class DomainValidationError extends Error {
  constructor(message: string) { super(message); this.name = "DomainValidationError"; }
}
export class NotFoundError extends Error {
  constructor(entity: string) { super(entity + " was not found"); this.name = "NotFoundError"; }
}
