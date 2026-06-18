// Domain errors — framework-agnostic. The web layer maps these to HTTP/UI.

export class DomainError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** Input failed a business/validation rule. */
export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, "VALIDATION");
  }
}

/** Caller is not allowed to perform the action. */
export class ForbiddenError extends DomainError {
  constructor(message = "Du har inte behörighet att göra detta.") {
    super(message, "FORBIDDEN");
  }
}

/** Caller is not authenticated. */
export class UnauthorizedError extends DomainError {
  constructor(message = "Du måste vara inloggad.") {
    super(message, "UNAUTHORIZED");
  }
}

/** The requested entity does not exist (or not within the caller's BRF). */
export class NotFoundError extends DomainError {
  constructor(message = "Hittades inte.") {
    super(message, "NOT_FOUND");
  }
}

/** The action conflicts with current state (e.g. double booking). */
export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, "CONFLICT");
  }
}
