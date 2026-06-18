import { randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { PasswordHasher, TokenGenerator } from "@/core/ports/services";

const scryptAsync = promisify(scrypt);
const KEYLEN = 64;

// scrypt-based hasher using Node's built-in crypto — no native dependency.
// Stored format: "<saltHex>:<hashHex>".
export const passwordHasher: PasswordHasher = {
  async hash(plain) {
    const salt = randomBytes(16);
    const derived = (await scryptAsync(plain, salt, KEYLEN)) as Buffer;
    return `${salt.toString("hex")}:${derived.toString("hex")}`;
  },
  async verify(plain, stored) {
    const [saltHex, hashHex] = stored.split(":");
    if (!saltHex || !hashHex) return false;
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const derived = (await scryptAsync(plain, salt, KEYLEN)) as Buffer;
    return (
      derived.length === expected.length && timingSafeEqual(derived, expected)
    );
  },
};

// Unguessable public token for bid links.
export const tokenGenerator: TokenGenerator = {
  generate() {
    return randomUUID().replace(/-/g, "") + randomBytes(8).toString("hex");
  },
};
