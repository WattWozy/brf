// Service ports — cross-cutting capabilities the domain needs but does not own.

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}

export interface TokenGenerator {
  /** Unguessable token for public bid links. */
  generate(): string;
}
