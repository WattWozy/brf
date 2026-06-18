// Composition root: wires concrete adapters into the use-case context.
// This is the *only* place the domain meets its implementations.

import type { UseCaseContext } from "@/core/usecases/context";
import {
  bidRepository,
  bookingRepository,
  brfRepository,
  documentRepository,
  issueRepository,
  jobRepository,
  postRepository,
  resourceRepository,
  userRepository,
} from "./db/repositories";
import { passwordHasher, tokenGenerator } from "./services";

export function getContext(): UseCaseContext {
  return {
    users: userRepository(),
    brfs: brfRepository(),
    issues: issueRepository(),
    jobs: jobRepository(),
    bids: bidRepository(),
    resources: resourceRepository(),
    bookings: bookingRepository(),
    posts: postRepository(),
    documents: documentRepository(),
    hasher: passwordHasher,
    tokens: tokenGenerator,
  };
}
